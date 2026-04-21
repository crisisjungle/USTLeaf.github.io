const adminState = {
    activeTab: 'pending',
    records: {
        pending: [],
        approved: [],
        rejected: []
    }
};

let adminClient = null;

document.addEventListener('DOMContentLoaded', () => {
    bindAdminEvents();
    initializeAdmin();
});

function bindAdminEvents() {
    document.querySelectorAll('.tab-button').forEach((button) => {
        button.addEventListener('click', () => {
            adminState.activeTab = button.dataset.tab;
            renderTabState();
            renderGroups();
        });
    });

    document.getElementById('refresh-button').addEventListener('click', () => {
        loadDashboard();
    });

    document.getElementById('migrate-button').addEventListener('click', async () => {
        await migrateLegacyPublishedData();
    });

    document.getElementById('groups-container').addEventListener('click', async (event) => {
        const actionButton = event.target.closest('[data-action]');
        if (!actionButton) {
            return;
        }

        const action = actionButton.dataset.action;
        if (action === 'approve-group') {
            await approveGroup(actionButton.dataset.groupId);
            return;
        }

        const card = actionButton.closest('.record-card');
        if (!card) {
            return;
        }

        const originalRecord = findRecord(card.dataset.recordId, card.dataset.status);
        if (!originalRecord) {
            setAdminStatus('未找到对应投稿，请刷新页面后重试。', 'error');
            return;
        }

        const updatedRecord = collectCardValues(card, originalRecord);
        if (!updatedRecord) {
            return;
        }

        if (action === 'save') {
            await saveRecord(updatedRecord);
        } else if (action === 'approve') {
            await moveRecord(updatedRecord, 'approved');
        } else if (action === 'reject') {
            await moveRecord(updatedRecord, 'rejected');
        }
    });
}

function initializeAdmin() {
    const configAlert = document.getElementById('config-alert');
    const adminConfigMessage = window.USTLeafOSS.getConfigErrorMessage('admin');

    if (adminConfigMessage) {
        configAlert.hidden = false;
        configAlert.textContent = `后台当前未配置完成。${adminConfigMessage}`;
        setAdminStatus('请先填写 admin/public OSS 配置，再使用审核后台。', 'warning');
        return;
    }

    configAlert.hidden = true;
    loadDashboard();
}

function setAdminStatus(message, type = 'info') {
    const status = document.getElementById('admin-status');
    status.textContent = message;
    status.dataset.status = type;
}

async function loadDashboard() {
    adminClient = window.USTLeafOSS.createClient('admin');
    if (!adminClient) {
        setAdminStatus(window.USTLeafOSS.getConfigErrorMessage('admin'), 'error');
        return;
    }

    setAdminStatus('正在加载投稿数据...', 'info');

    try {
        const [submissionRecords, approved, rejected] = await Promise.all([
            fetchRecordsForPrefix('submissions/data/', 'pending'),
            fetchRecordsForPrefix('published/data/', 'approved'),
            fetchRecordsForPrefix('rejected/data/', 'rejected')
        ]);

        const finalizedIds = new Set([
            ...approved.map((record) => record.id),
            ...rejected.map((record) => record.id)
        ]);
        const pending = submissionRecords.filter((record) => (
            record.status !== 'approved'
            && record.status !== 'rejected'
            && !finalizedIds.has(record.id)
        ));
        const hiddenSubmissionCount = submissionRecords.length - pending.length;

        adminState.records = { pending, approved, rejected };
        updateTabCounts();
        renderTabState();
        renderGroups();
        const hiddenSuffix = hiddenSubmissionCount > 0
            ? ` 已隐藏 ${hiddenSubmissionCount} 条已审核但尚未清理的 submissions 副本。`
            : '';
        setAdminStatus(
            `已加载 ${pending.length + approved.length + rejected.length} 条投稿记录。${hiddenSuffix}`,
            'success'
        );
    } catch (error) {
        console.error('Failed to load admin dashboard:', error);
        setAdminStatus(`加载失败：${error.message}`, 'error');
    }
}

async function listAllObjects(prefix) {
    const allObjects = [];
    let marker = '';
    let hasMore = true;

    while (hasMore) {
        const result = await adminClient.list({
            prefix,
            marker,
            'max-keys': 100
        });

        if (result.objects) {
            allObjects.push(...result.objects);
        }

        hasMore = Boolean(result.isTruncated);
        marker = result.nextMarker || '';
    }

    return allObjects;
}

async function fetchJsonObject(objectKey) {
    const result = await adminClient.get(objectKey);
    const text = new TextDecoder('utf-8').decode(result.content);
    return JSON.parse(text);
}

async function fetchRecordsForPrefix(prefix, status) {
    const objects = await listAllObjects(prefix);

    const records = await Promise.all(objects.map(async (object) => {
        try {
            const rawRecord = await fetchJsonObject(object.name);
            return {
                ...window.USTLeafAlbum.normalizeRecord(rawRecord),
                _bucketStatus: status,
                _dataKey: object.name
            };
        } catch (error) {
            console.warn('Failed to fetch record:', object.name, error);
            return null;
        }
    }));

    return records
        .filter(Boolean)
        .sort((left, right) => new Date(right.created_at || 0) - new Date(left.created_at || 0));
}

function updateTabCounts() {
    document.getElementById('count-pending').textContent = adminState.records.pending.length;
    document.getElementById('count-approved').textContent = adminState.records.approved.length;
    document.getElementById('count-rejected').textContent = adminState.records.rejected.length;
}

function renderTabState() {
    document.querySelectorAll('.tab-button').forEach((button) => {
        button.classList.toggle('active', button.dataset.tab === adminState.activeTab);
    });
}

function groupRecords(records) {
    const grouped = new Map();

    records.forEach((record) => {
        const groupId = record.submission_group_id || `legacy-${record.id}`;
        if (!grouped.has(groupId)) {
            grouped.set(groupId, []);
        }
        grouped.get(groupId).push(record);
    });

    return [...grouped.entries()]
        .map(([groupId, groupRecords]) => ({
            groupId,
            records: groupRecords.sort((left, right) => new Date(right.created_at || 0) - new Date(left.created_at || 0)),
            latestCreatedAt: groupRecords.reduce((latest, record) => {
                const current = new Date(record.created_at || 0).getTime();
                return current > latest ? current : latest;
            }, 0)
        }))
        .sort((left, right) => right.latestCreatedAt - left.latestCreatedAt);
}

function renderGroups() {
    const groupsContainer = document.getElementById('groups-container');
    const groups = groupRecords(adminState.records[adminState.activeTab] || []);

    if (groups.length === 0) {
        groupsContainer.innerHTML = `
            <div class="empty-state">
                当前分组下还没有记录。
            </div>
        `;
        return;
    }

    groupsContainer.innerHTML = groups.map((group) => renderGroup(group)).join('');
}

function renderGroup(group) {
    const latestDate = group.latestCreatedAt
        ? window.USTLeafAlbum.formatDate(new Date(group.latestCreatedAt).toISOString())
        : '未知时间';

    return `
        <article class="group-card" data-group-id="${window.USTLeafAlbum.escapeHtml(group.groupId)}">
            <div class="group-header">
                <div>
                    <span class="status-pill ${adminState.activeTab}">${adminState.activeTab}</span>
                    <h2>批次 ${window.USTLeafAlbum.escapeHtml(group.groupId)}</h2>
                    <div class="group-meta">
                        <span>${group.records.length} 张照片</span>
                        <span>最新提交：${window.USTLeafAlbum.escapeHtml(latestDate)}</span>
                    </div>
                </div>
                <div class="group-actions">
                    ${adminState.activeTab === 'pending' ? `
                        <button class="primary-button" data-action="approve-group" data-group-id="${window.USTLeafAlbum.escapeHtml(group.groupId)}">
                            整批通过
                        </button>
                    ` : ''}
                </div>
            </div>
            <div class="records-grid">
                ${group.records.map((record) => renderRecordCard(record)).join('')}
            </div>
        </article>
    `;
}

function renderRecordCard(record) {
    const previewUrl = window.USTLeafOSS.getObjectUrl(adminClient, record.image_key, {
        preferSigned: true,
        role: 'admin'
    });

    return `
        <article class="record-card" data-record-id="${window.USTLeafAlbum.escapeHtml(record.id)}" data-status="${window.USTLeafAlbum.escapeHtml(record._bucketStatus)}">
            <img class="record-preview" src="${previewUrl}" alt="${window.USTLeafAlbum.escapeHtml(record.note || record.location_text || record.id)}">
            <div class="record-body">
                <div class="record-meta">
                    <span>${window.USTLeafAlbum.escapeHtml(window.USTLeafAlbum.formatDate(record.created_at) || '未知日期')}</span>
                    <span>${window.USTLeafAlbum.escapeHtml(record.id)}</span>
                </div>
                <div class="record-fields">
                    <label>
                        昵称
                        <input type="text" data-field="contributor_name" value="${window.USTLeafAlbum.escapeHtml(record.contributor_name || '')}">
                    </label>
                    <label>
                        拍摄位置
                        <textarea data-field="location_text" required>${window.USTLeafAlbum.escapeHtml(record.location_text || '')}</textarea>
                    </label>
                    <label>
                        猜测植物
                        <input type="text" data-field="plant_guess" value="${window.USTLeafAlbum.escapeHtml(record.plant_guess || '')}">
                    </label>
                    <label>
                        补充说明
                        <textarea data-field="note">${window.USTLeafAlbum.escapeHtml(record.note || '')}</textarea>
                    </label>
                </div>
                <div class="record-actions">
                    <button class="secondary-button" data-action="save">保存</button>
                    ${record._bucketStatus !== 'approved' ? '<button class="primary-button" data-action="approve">通过</button>' : ''}
                    ${record._bucketStatus !== 'rejected' ? '<button class="danger-button" data-action="reject">拒绝</button>' : ''}
                </div>
            </div>
        </article>
    `;
}

function findRecord(recordId, bucketStatus) {
    return (adminState.records[bucketStatus] || []).find((record) => record.id === recordId);
}

function collectCardValues(card, originalRecord) {
    const contributorName = card.querySelector('[data-field="contributor_name"]').value.trim();
    const locationText = card.querySelector('[data-field="location_text"]').value.trim();
    const plantGuess = card.querySelector('[data-field="plant_guess"]').value.trim();
    const note = card.querySelector('[data-field="note"]').value.trim();

    if (!locationText) {
        setAdminStatus('拍摄位置不能为空，请先补全该字段。', 'warning');
        card.querySelector('[data-field="location_text"]').focus();
        return null;
    }

    return {
        ...originalRecord,
        contributor_name: contributorName,
        location_text: locationText,
        plant_guess: plantGuess,
        note
    };
}

function getFileExtension(objectKey) {
    const matched = String(objectKey || '').match(/\.([a-zA-Z0-9]+)$/);
    return matched ? matched[1].toLowerCase() : 'jpg';
}

function getPublishedImageUrl(objectKey) {
    if (window.USTLeafOSS.isConfigured('public')) {
        return window.USTLeafOSS.buildObjectUrl(objectKey, 'public');
    }

    return window.USTLeafOSS.buildObjectUrl(objectKey, 'admin');
}

function buildStoredRecord(record) {
    const normalized = window.USTLeafAlbum.normalizeRecord(record);
    return {
        id: normalized.id,
        submission_group_id: normalized.submission_group_id,
        status: normalized.status,
        created_at: normalized.created_at,
        reviewed_at: normalized.reviewed_at || null,
        image_key: normalized.image_key,
        image_url: normalized.status === 'approved' ? getPublishedImageUrl(normalized.image_key) : '',
        contributor_name: normalized.contributor_name || '',
        location_text: normalized.location_text || '',
        plant_guess: normalized.plant_guess || '',
        note: normalized.note || '',
        source: normalized.source || 'student_upload'
    };
}

async function putJsonObject(objectKey, payload) {
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    await adminClient.put(objectKey, blob, { timeout: 60000 });
}

async function safeDelete(objectKey) {
    if (!objectKey) {
        return true;
    }

    try {
        await adminClient.delete(objectKey);
        return true;
    } catch (error) {
        console.warn('Failed to delete object:', objectKey, error);
        return false;
    }
}

function buildCleanupMessage(cleanupFailures) {
    if (cleanupFailures === 0) {
        return '';
    }

    return ' 原 submissions 副本删除失败，但审批结果已生效；如需彻底清理，请在 OSS CORS 中补充 DELETE 权限。';
}

async function saveRecord(record) {
    setAdminStatus(`正在保存 ${record.id}...`, 'info');

    const storedRecord = buildStoredRecord(record);
    await putJsonObject(record._dataKey, storedRecord);
    setAdminStatus(`已保存 ${record.id}。`, 'success');
    await loadDashboard();
}

async function moveRecord(record, targetStatus) {
    const targetPrefix = targetStatus === 'approved' ? 'published' : 'rejected';
    const sourceImageKey = record.image_key;
    const sourceDataKey = record._dataKey;
    const fileExt = getFileExtension(sourceImageKey);
    const targetImageKey = `${targetPrefix}/photos/${record.submission_group_id}/${record.id}.${fileExt}`;
    const targetDataKey = `${targetPrefix}/data/${record.id}.json`;
    let cleanupFailures = 0;

    setAdminStatus(`正在将 ${record.id} 移动到 ${targetStatus}...`, 'info');

    if (sourceImageKey !== targetImageKey) {
        await adminClient.copy(targetImageKey, sourceImageKey);
    }

    const movedRecord = {
        ...record,
        status: targetStatus,
        reviewed_at: new Date().toISOString(),
        image_key: targetImageKey,
        image_url: targetStatus === 'approved' ? getPublishedImageUrl(targetImageKey) : ''
    };

    await putJsonObject(targetDataKey, buildStoredRecord(movedRecord));

    if (sourceDataKey !== targetDataKey) {
        const deleted = await safeDelete(sourceDataKey);
        if (!deleted) {
            cleanupFailures += 1;
        }
    }

    if (sourceImageKey !== targetImageKey) {
        const deleted = await safeDelete(sourceImageKey);
        if (!deleted) {
            cleanupFailures += 1;
        }
    }

    setAdminStatus(
        `已将 ${record.id} 移动到 ${targetStatus}。${buildCleanupMessage(cleanupFailures)}`,
        cleanupFailures > 0 ? 'warning' : 'success'
    );
    await loadDashboard();
}

async function approveGroup(groupId) {
    const groupRecords = adminState.records.pending.filter((record) => record.submission_group_id === groupId);
    if (groupRecords.length === 0) {
        setAdminStatus('这个批次已经不在待审核列表中了，请刷新后重试。', 'warning');
        return;
    }

    const groupElement = [...document.querySelectorAll('.group-card')].find((element) => element.dataset.groupId === groupId);
    const preparedRecords = [];

    if (groupElement) {
        for (const card of groupElement.querySelectorAll('.record-card')) {
            const originalRecord = findRecord(card.dataset.recordId, card.dataset.status);
            if (!originalRecord) {
                continue;
            }

            const updatedRecord = collectCardValues(card, originalRecord);
            if (!updatedRecord) {
                return;
            }
            preparedRecords.push(updatedRecord);
        }
    }

    const recordsToApprove = preparedRecords.length > 0 ? preparedRecords : groupRecords;

    setAdminStatus(`正在整批通过 ${groupId}...`, 'info');

    let successCount = 0;
    const errors = [];
    let cleanupFailures = 0;

    for (const record of recordsToApprove) {
        try {
            const targetImageKey = `published/photos/${record.submission_group_id}/${record.id}.${getFileExtension(record.image_key)}`;
            await adminClient.copy(targetImageKey, record.image_key);
            await putJsonObject(`published/data/${record.id}.json`, buildStoredRecord({
                ...record,
                status: 'approved',
                reviewed_at: new Date().toISOString(),
                image_key: targetImageKey,
                image_url: getPublishedImageUrl(targetImageKey)
            }));
            if (!(await safeDelete(record._dataKey))) {
                cleanupFailures += 1;
            }
            if (!(await safeDelete(record.image_key))) {
                cleanupFailures += 1;
            }
            successCount++;
        } catch (error) {
            console.error('Failed to approve record in batch:', record.id, error);
            errors.push(`${record.id}: ${error.message}`);
        }
    }

    if (errors.length > 0) {
        setAdminStatus(`整批通过完成，但有 ${errors.length} 条失败。`, 'warning');
        alert(`整批通过已执行，成功 ${successCount} 条，失败 ${errors.length} 条。\n${errors.join('\n')}`);
    } else {
        setAdminStatus(
            `批次 ${groupId} 已全部通过。${buildCleanupMessage(cleanupFailures)}`,
            cleanupFailures > 0 ? 'warning' : 'success'
        );
    }

    await loadDashboard();
}

async function migrateLegacyPublishedData() {
    if (!adminClient) {
        adminClient = window.USTLeafOSS.createClient('admin');
    }

    if (!adminClient) {
        setAdminStatus(window.USTLeafOSS.getConfigErrorMessage('admin'), 'error');
        return;
    }

    const shouldProceed = window.confirm('迁移会把旧的 data/ + photos/ 内容复制到 published/ 下。继续吗？');
    if (!shouldProceed) {
        return;
    }

    setAdminStatus('正在扫描旧版公开数据...', 'info');

    try {
        const [legacyDataFiles, publishedDataFiles] = await Promise.all([
            listAllObjects('data/'),
            listAllObjects('published/data/')
        ]);

        const existingIds = new Set(
            publishedDataFiles.map((file) => file.name.split('/').pop().replace(/\.json$/, ''))
        );

        let migrated = 0;
        let skipped = 0;
        const errors = [];

        for (const legacyFile of legacyDataFiles) {
            const legacyId = legacyFile.name.split('/').pop().replace(/\.json$/, '');
            if (existingIds.has(legacyId)) {
                skipped++;
                continue;
            }

            try {
                const legacyData = await fetchJsonObject(legacyFile.name);
                const normalized = window.USTLeafAlbum.normalizeRecord({
                    ...legacyData,
                    id: legacyData.id || legacyId
                });
                const sourceImageKey = normalized.image_key || window.USTLeafAlbum.extractObjectKeyFromUrl(legacyData.image_url || '');

                if (!sourceImageKey) {
                    throw new Error('旧记录缺少图片路径');
                }

                const targetGroupId = normalized.submission_group_id || `legacy-${normalized.id}`;
                const targetImageKey = `published/photos/${targetGroupId}/${normalized.id}.${getFileExtension(sourceImageKey)}`;
                const migratedRecord = {
                    ...normalized,
                    submission_group_id: targetGroupId,
                    status: 'approved',
                    reviewed_at: normalized.reviewed_at || normalized.created_at || new Date().toISOString(),
                    location_text: normalized.location_text || window.USTLeafAlbum.LEGACY_LOCATION_FALLBACK,
                    note: normalized.note || '',
                    image_key: targetImageKey,
                    image_url: getPublishedImageUrl(targetImageKey)
                };

                await adminClient.copy(targetImageKey, sourceImageKey);
                await putJsonObject(`published/data/${normalized.id}.json`, buildStoredRecord(migratedRecord));
                migrated++;
            } catch (error) {
                console.error('Failed to migrate legacy record:', legacyFile.name, error);
                errors.push(`${legacyFile.name}: ${error.message}`);
            }
        }

        if (errors.length > 0) {
            setAdminStatus(`迁移完成，成功 ${migrated} 条，跳过 ${skipped} 条，失败 ${errors.length} 条。`, 'warning');
            alert(`迁移完成：成功 ${migrated} 条，跳过 ${skipped} 条，失败 ${errors.length} 条。\n${errors.join('\n')}`);
        } else {
            setAdminStatus(`迁移完成：成功 ${migrated} 条，跳过 ${skipped} 条。`, 'success');
        }

        await loadDashboard();
    } catch (error) {
        console.error('Legacy migration failed:', error);
        setAdminStatus(`迁移失败：${error.message}`, 'error');
    }
}
