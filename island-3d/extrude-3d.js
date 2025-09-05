// 2D 이미지를 압출하여 3D 볼륨 생성
class Extrude3D {
    constructor() {
        this.textureLoader = new THREE.TextureLoader();
    }

    // 2D 이미지의 알파 채널을 이용해 3D 형태 생성
    createExtrudedObject(imagePath, width = 1, height = 1, depth = 0.2) {
        const texture = this.textureLoader.load(imagePath);
        
        // 기본 박스 형태로 압출
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshLambertMaterial({
            map: texture,
            transparent: true
        });

        const object = new THREE.Mesh(geometry, material);
        object.castShadow = true;
        object.receiveShadow = true;
        
        return object;
    }

    // 동물의 숲 스타일 간판
    createSign(text, x, z, height) {
        // 간판 배경
        const signGeometry = new THREE.BoxGeometry(1.5, 0.8, 0.1);
        const signMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const sign = new THREE.Mesh(signGeometry, signMaterial);
        
        // 텍스트 텍스처 생성
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 128;
        const context = canvas.getContext('2d');
        
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, 256, 128);
        context.fillStyle = '#000000';
        context.font = '24px Arial';
        context.textAlign = 'center';
        context.fillText(text, 128, 70);
        
        const textTexture = new THREE.CanvasTexture(canvas);
        const textMaterial = new THREE.MeshLambertMaterial({ map: textTexture });
        
        const textPlane = new THREE.PlaneGeometry(1.4, 0.7);
        const textMesh = new THREE.Mesh(textPlane, textMaterial);
        textMesh.position.z = 0.06;
        
        const group = new THREE.Group();
        group.add(sign);
        group.add(textMesh);
        group.position.set(x, height + 0.4, z);
        
        return group;
    }

    // 2D 이미지로 3D 건물 생성
    createBuilding3D(frontImage, sideImage, x, z, height, buildingWidth = 2, buildingHeight = 2, buildingDepth = 2) {
        const group = new THREE.Group();
        
        // 정면
        const frontTexture = this.textureLoader.load(frontImage);
        const front = new THREE.Mesh(
            new THREE.PlaneGeometry(buildingWidth, buildingHeight),
            new THREE.MeshLambertMaterial({ map: frontTexture })
        );
        front.position.set(0, buildingHeight/2, buildingDepth/2);
        
        // 측면
        const sideTexture = this.textureLoader.load(sideImage);
        const side = new THREE.Mesh(
            new THREE.PlaneGeometry(buildingDepth, buildingHeight),
            new THREE.MeshLambertMaterial({ map: sideTexture })
        );
        side.position.set(buildingWidth/2, buildingHeight/2, 0);
        side.rotation.y = -Math.PI/2;
        
        // 지붕
        const roof = new THREE.Mesh(
            new THREE.PlaneGeometry(buildingWidth, buildingDepth),
            new THREE.MeshLambertMaterial({ color: 0x8B0000 })
        );
        roof.position.set(0, buildingHeight, 0);
        roof.rotation.x = -Math.PI/2;
        
        group.add(front);
        group.add(side);
        group.add(roof);
        group.position.set(x, height, z);
        
        return group;
    }
}

// 사용 예시
const extrude3D = new Extrude3D();

function addExtrudedObject(x, z, type) {
    const height = heightMap[x][z];
    let object;

    switch(type) {
        case 'house':
            object = extrude3D.createBuilding3D(
                '/images/house_front.png',
                '/images/house_side.png',
                x - islandSize/2, z - islandSize/2, height
            );
            break;
        case 'sign':
            object = extrude3D.createSign('Welcome!', x - islandSize/2, z - islandSize/2, height);
            break;
    }

    if (object) {
        scene.add(object);
        island.objects.push(object);
    }
}