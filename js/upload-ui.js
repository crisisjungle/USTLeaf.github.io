
// UI Logic for Upload Modal
// Dependencies: upload.js (must be loaded)

document.addEventListener('DOMContentLoaded', () => {
    const fabButton = document.getElementById('upload-fab');
    const modal = document.getElementById('upload-modal');
    const closeModal = document.getElementById('close-modal');
    const fileInput = document.getElementById('file-input');
    const dropArea = document.getElementById('drop-area');
    const previewGrid = document.getElementById('preview-grid');
    const btnUpload = document.getElementById('btn-upload');
    const contributorInput = document.getElementById('contributor-name');
    const locationInput = document.getElementById('location-text');
    const plantGuessInput = document.getElementById('plant-guess');
    const noteInput = document.getElementById('submission-note');
    const progressContainer = document.getElementById('upload-progress-container');
    const progressBar = document.getElementById('upload-progress-bar');
    const statusText = document.getElementById('upload-status-text');

    const selectedFiles = new Map();

    if (localStorage.getItem('ust_contributor_name') && contributorInput) {
        contributorInput.value = localStorage.getItem('ust_contributor_name');
    }

    function toggleModal(open) {
        if (!modal) {
            return;
        }

        modal.style.display = open ? 'flex' : 'none';
        document.body.style.overflow = open ? 'hidden' : '';
    }

    if (fabButton) {
        fabButton.addEventListener('click', () => {
            toggleModal(true);
        });
    }

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            toggleModal(false);
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                toggleModal(false);
            }
        });
    }

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
        const imageFiles = [...files].filter((file) => file.type.match('image.*'));

        if (selectedFiles.size + imageFiles.length > 50) {
            alert("一次最多只能上传 50 张图片");
            return;
        }

        imageFiles.forEach((file) => {
            const id = Math.random().toString(36).slice(2, 11);
            selectedFiles.set(id, { file });

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

        const delBtn = document.createElement('button');
        delBtn.className = 'action-btn delete';
        delBtn.innerHTML = '&times;';
        delBtn.title = "删除";
        delBtn.onclick = (e) => {
            e.stopPropagation();
            selectedFiles.delete(id);
            div.remove();
        };

        actions.appendChild(delBtn);

        div.appendChild(img);
        div.appendChild(actions);

        previewGrid.appendChild(div);
    }

    function resetUploadForm() {
        selectedFiles.clear();
        previewGrid.innerHTML = '';
        fileInput.value = '';
        progressContainer.style.display = 'none';
        progressBar.style.width = '0%';
        statusText.innerText = '准备提交...';
        btnUpload.disabled = false;

        if (locationInput) locationInput.value = '';
        if (plantGuessInput) plantGuessInput.value = '';
        if (noteInput) noteInput.value = '';
    }

    if (btnUpload) {
        btnUpload.addEventListener('click', async () => {
            const contributorName = contributorInput ? contributorInput.value.trim() : '';
            const locationText = locationInput ? locationInput.value.trim() : '';
            const plantGuess = plantGuessInput ? plantGuessInput.value.trim() : '';
            const note = noteInput ? noteInput.value.trim() : '';

            if (!locationText) {
                alert("请填写拍摄位置");
                if (locationInput) {
                    locationInput.focus();
                }
                return;
            }

            if (selectedFiles.size === 0) {
                alert("请至少选择一张图片");
                return;
            }

            localStorage.setItem('ust_contributor_name', contributorName);

            const filesToUpload = [...selectedFiles.values()].map((value) => value.file);

            btnUpload.disabled = true;
            progressContainer.style.display = 'block';
            statusText.innerText = "正在提交审核...";
            progressBar.style.width = '0%';

            try {
                if (!window.USTUpload) {
                    throw new Error("Upload module not loaded");
                }

                const result = await window.USTUpload.uploadBatch(
                    filesToUpload,
                    {
                        contributor_name: contributorName,
                        location_text: locationText,
                        plant_guess: plantGuess,
                        note
                    },
                    (percent) => {
                        progressBar.style.width = `${percent}%`;
                        statusText.innerText = `提交流程: ${Math.round(percent)}%`;
                    }
                );

                if (result.failed > 0) {
                    console.error("Upload Errors:", result.errors);
                    if (result.success === 0) {
                        statusText.innerText = "提交失败: " + result.errors[0];
                        alert("提交失败！\n错误信息: " + result.errors.join("\n"));
                        btnUpload.disabled = false;
                        return;
                    } else {
                        statusText.innerText = `已提交 ${result.success} 张，另有 ${result.failed} 张失败`;
                        alert(`已提交 ${result.success} 张照片进入审核，但仍有 ${result.failed} 张失败。\n错误: ${result.errors.join("\n")}`);
                    }
                } else {
                    statusText.innerText = "已提交审核，管理员通过后会公开展示。";
                    alert("提交成功！照片已进入审核队列，管理员通过后会公开展示。");
                }

                setTimeout(() => {
                    if (result.success > 0) {
                        toggleModal(false);
                        resetUploadForm();
                    }
                }, 1500);

            } catch (err) {
                console.error(err);
                statusText.innerText = "提交出错: " + err.message;
                btnUpload.disabled = false;
            }
        });
    }
});
