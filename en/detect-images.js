// 检测杜鹃文件夹中的图片文件
document.addEventListener('DOMContentLoaded', function() {
    console.log('正在检测杜鹃文件夹中的图片文件...');
    
    const folderPath = 'plant-database/0314锦绣杜鹃/';
    const imageExtensions = ['.jpg', '.JPG', '.jpeg', '.JPEG', '.png', '.PNG', '.gif', '.GIF'];
    const foundImages = [];
    
    // 创建一个列表来存储可能的文件名
    const possibleNames = [];
    
    // 添加常见的命名模式
    for (let i = 1; i <= 20; i++) {
        possibleNames.push(`${i}.jpg`);
        possibleNames.push(`${i}.JPG`);
        possibleNames.push(`0314_${i}.jpg`);
        possibleNames.push(`0314_${i}.JPG`);
        possibleNames.push(`杜鹃_${i}.jpg`);
        possibleNames.push(`杜鹃_${i}.JPG`);
    }
    
    // 添加特殊命名
    const specialTypes = ['flower', 'leaf', 'bud', 'stamen', 'branch', 'bark', 'fruit'];
    specialTypes.forEach(type => {
        possibleNames.push(`0314_${type}.jpg`);
        possibleNames.push(`0314_${type}.JPG`);
        possibleNames.push(`杜鹃_${type}.jpg`);
        possibleNames.push(`杜鹃_${type}.JPG`);
        
        // 添加带编号的特殊文件名
        for (let i = 1; i <= 5; i++) {
            possibleNames.push(`0314_${type}${i}.jpg`);
            possibleNames.push(`0314_${type}${i}.JPG`);
            possibleNames.push(`0314_${type}_${i}.jpg`);
            possibleNames.push(`0314_${type}_${i}.JPG`);
            possibleNames.push(`杜鹃_${type}${i}.jpg`);
            possibleNames.push(`杜鹃_${type}${i}.JPG`);
        }
    });
    
    // 检查图片是否存在
    async function checkImage(path) {
        return new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = path;
        });
    }
    
    // 逐个检查可能的图片
    async function detectImages() {
        console.log(`开始检测 ${possibleNames.length} 个可能的图片文件...`);
        
        const resultDiv = document.createElement('div');
        resultDiv.id = 'detection-result';
        resultDiv.style.cssText = 'position:fixed; top:10px; right:10px; padding:20px; background:white; border:1px solid #ccc; border-radius:5px; z-index:9999; max-height:80vh; overflow-y:auto; width:300px;';
        document.body.appendChild(resultDiv);
        
        resultDiv.innerHTML = '<h3>杜鹃图片检测中...</h3><p>请稍候，正在检测文件夹中的图片。</p>';
        
        for (const name of possibleNames) {
            const path = folderPath + name;
            const exists = await checkImage(path);
            
            if (exists) {
                console.log(`找到图片: ${path}`);
                foundImages.push(name);
                resultDiv.innerHTML = `<h3>杜鹃图片检测</h3><p>已找到 ${foundImages.length} 张图片</p><pre>${JSON.stringify(foundImages, null, 2)}</pre>`;
            }
        }
        
        // 显示最终结果
        console.log(`检测完成，找到 ${foundImages.length} 张图片:`, foundImages);
        resultDiv.innerHTML = `
            <h3>杜鹃图片检测完成</h3>
            <p>共找到 ${foundImages.length} 张图片:</p>
            <pre>${JSON.stringify(foundImages, null, 2)}</pre>
            <p>您可以将这些文件名复制到plant-catalog.json中</p>
            <button id="copy-result" style="padding:5px 10px; margin-top:10px;">复制结果</button>
            <button id="close-result" style="padding:5px 10px; margin-top:10px; margin-left:10px;">关闭</button>
        `;
        
        // 添加复制和关闭按钮的功能
        document.getElementById('copy-result').addEventListener('click', function() {
            const resultText = JSON.stringify(foundImages, null, 2);
            navigator.clipboard.writeText(resultText).then(() => {
                alert('已复制到剪贴板!');
            });
        });
        
        document.getElementById('close-result').addEventListener('click', function() {
            document.body.removeChild(resultDiv);
        });
    }
    
    // 开始检测
    detectImages();
}); 