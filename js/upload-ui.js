
// UI Logic for Upload Modal
// Dependencies: upload.js (must be loaded)

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const fabButton = document.getElementById('upload-fab');
    const modal = document.getElementById('upload-modal');
    const closeModal = document.getElementById('close-modal');
    const fileInput = document.getElementById('file-input');
    const dropArea = document.getElementById('drop-area');
    const previewGrid = document.getElementById('preview-grid');
    const btnUpload = document.getElementById('btn-upload');
    const nameInput = document.getElementById('photographer-name');
    const majorInput = document.getElementById('photographer-major');
    const progressContainer = document.getElementById('upload-progress-container');
    const progressBar = document.getElementById('upload-progress-bar');
    const statusText = document.getElementById('upload-status-text');

    // State
    const selectedFiles = new Map(); // key: id, value: { file: FileObject, description: String }

    // Load cached user info
    if (localStorage.getItem('ust_user_name')) {
        nameInput.value = localStorage.getItem('ust_user_name');
    }
    if (localStorage.getItem('ust_user_major')) {
        majorInput.value = localStorage.getItem('ust_user_major');
    }

    // Event Listeners - Modal Control
    if (fabButton) {
        fabButton.addEventListener('click', () => {
            modal.style.display = 'flex';
        });
    }

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    // File Drag & Drop
    if (dropArea) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        dropArea.addEventListener('drop', handleDrop, false);
    }

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            handleFiles(e.target.files);
        });
    }

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    function handleFiles(files) {
        if (selectedFiles.size + files.length > 50) {
            alert("一次最多只能上传 50 张图片");
            return;
        }

        ([...files]).forEach(file => {
            // Check if image
            if (!file.type.match('image.*')) return;

            // Use a unique ID for the key to allow same-name files
            const id = Math.random().toString(36).substr(2, 9);

            selectedFiles.set(id, {
                file: file,
                description: ""
            });

            addPreviewItem(id, file);
        });
    }

    function addPreviewItem(id, file) {
        const div = document.createElement('div');
        div.className = 'preview-item';
        div.dataset.id = id;

        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.onload = () => URL.revokeObjectURL(img.src); // Free memory

        const actions = document.createElement('div');
        actions.className = 'preview-actions';

        // Delete Button
        const delBtn = document.createElement('button');
        delBtn.className = 'action-btn delete';
        delBtn.innerHTML = '&times;';
        delBtn.title = "删除";
        delBtn.onclick = (e) => {
            e.stopPropagation();
            selectedFiles.delete(id);
            div.remove();
        };

        // Edit Button
        const editBtn = document.createElement('button');
        editBtn.className = 'action-btn edit';
        editBtn.innerHTML = '✎';
        editBtn.title = "添加/修改 简介";
        editBtn.onclick = (e) => {
            e.stopPropagation();
            toggleEditDescription(div, id);
        };

        actions.appendChild(editBtn);
        actions.appendChild(delBtn);

        // Edit Overlay
        const editOverlay = document.createElement('div');
        editOverlay.className = 'edit-overlay';
        const textarea = document.createElement('textarea');
        textarea.placeholder = "输入简介...";
        textarea.addEventListener('click', e => e.stopPropagation()); // Prevent closing
        textarea.addEventListener('input', (e) => {
            const data = selectedFiles.get(id);
            if (data) {
                data.description = e.target.value;
                selectedFiles.set(id, data);
            }
        });
        textarea.addEventListener('change', (e) => {
            if (e.target.value.trim()) {
                div.classList.add('has-description');
            } else {
                div.classList.remove('has-description');
            }
        });

        editOverlay.appendChild(textarea);

        // Indicator
        const indicator = document.createElement('div');
        indicator.className = 'description-indicator';
        indicator.innerText = '📝';

        div.appendChild(img);
        div.appendChild(actions);
        div.appendChild(editOverlay);
        div.appendChild(indicator);

        // Click outside to close edit
        document.addEventListener('click', (e) => {
            if (!div.contains(e.target)) {
                div.classList.remove('editing');
            }
        });

        previewGrid.appendChild(div);
    }

    function toggleEditDescription(itemDiv, id) {
        // Close others
        document.querySelectorAll('.preview-item.editing').forEach(el => {
            if (el !== itemDiv) el.classList.remove('editing');
        });

        itemDiv.classList.toggle('editing');
        if (itemDiv.classList.contains('editing')) {
            const textarea = itemDiv.querySelector('textarea');
            textarea.value = selectedFiles.get(id).description;
            textarea.focus();
        }
    }

    // Upload Action
    if (btnUpload) {
        btnUpload.addEventListener('click', async () => {
            const name = nameInput.value.trim();
            const major = majorInput.value.trim();

            if (!name) {
                alert("请填写昵称");
                nameInput.focus();
                return;
            }

            if (selectedFiles.size === 0) {
                alert("请至少选择一张图片");
                return;
            }

            // Cache User Info
            localStorage.setItem('ust_user_name', name);
            localStorage.setItem('ust_user_major', major);

            // Prepare Data
            const filesToUpload = [];
            const fileSpecificMeta = {};

            selectedFiles.forEach((value, key) => {
                filesToUpload.push(value.file);
                // Use filename as key for now as per upload.js contract
                // WARNING: Duplicates will overwrite description. 
                fileSpecificMeta[value.file.name] = value.description;
            });

            // UI Updates
            btnUpload.disabled = true;
            progressContainer.style.display = 'block';
            statusText.innerText = "正在压缩并上传...";
            progressBar.style.width = '0%';

            try {
                if (!window.USTUpload) {
                    throw new Error("Upload module not loaded");
                }

                const result = await window.USTUpload.uploadBatch(
                    filesToUpload,
                    { name, major },
                    fileSpecificMeta,
                    (percent) => {
                        progressBar.style.width = `${percent}%`;
                        statusText.innerText = `上传进度: ${Math.round(percent)}%`;
                    }
                );

                if (result.failed > 0) {
                    console.error("Upload Errors:", result.errors);
                    // If some failed, show error
                    if (result.success === 0) {
                        statusText.innerText = "上传全部失败: " + result.errors[0];
                        alert("上传失败！\n错误信息: " + result.errors.join("\n"));
                        btnUpload.disabled = false;
                        return; // Don't close modal
                    } else {
                        statusText.innerText = `部分成功: ${result.success} 张成功, ${result.failed} 张失败`;
                        alert(`上传完成，但有 ${result.failed} 张图片失败。\n错误: ` + result.errors.join("\n"));
                    }
                } else {
                    statusText.innerText = "上传成功！感谢您的分享。";
                }

                setTimeout(() => {
                    if (result.success > 0) {
                        modal.style.display = 'none';
                        // Reset
                        selectedFiles.clear();
                        previewGrid.innerHTML = '';
                        fileInput.value = '';
                        btnUpload.disabled = false;
                        progressContainer.style.display = 'none';

                        if (window.location.pathname.includes('ust-album')) {
                            location.reload();
                        }
                    }
                }, 1500);

            } catch (err) {
                console.error(err);
                statusText.innerText = "上传出错: " + err.message;
                btnUpload.disabled = false;
            }
        });
    }
});
