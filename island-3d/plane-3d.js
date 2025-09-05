// 2D 이미지를 평면 메시로 3D 변환
class Plane3D {
    constructor() {
        this.textureLoader = new THREE.TextureLoader();
    }

    // 2D 이미지로 평면 메시 생성
    createPlane(imagePath, width = 1, height = 1, doubleSided = true) {
        const texture = this.textureLoader.load(imagePath);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;

        const geometry = new THREE.PlaneGeometry(width, height);
        const material = new THREE.MeshLambertMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.5,
            side: doubleSided ? THREE.DoubleSide : THREE.FrontSide
        });

        const plane = new THREE.Mesh(geometry, material);
        plane.castShadow = true;
        plane.receiveShadow = true;
        
        return plane;
    }

    // 십자형 나무 (4방향에서 보이도록)
    createCrossTree(x, z, height) {
        const group = new THREE.Group();
        
        // 첫 번째 평면
        const tree1 = this.createPlane('/images/tree.png', 2, 3);
        tree1.position.set(0, 1.5, 0);
        
        // 두 번째 평면 (90도 회전)
        const tree2 = this.createPlane('/images/tree.png', 2, 3);
        tree2.position.set(0, 1.5, 0);
        tree2.rotation.y = Math.PI / 2;
        
        group.add(tree1);
        group.add(tree2);
        group.position.set(x, height, z);
        
        return group;
    }

    // 건물 (정면만)
    createBuilding(imagePath, x, z, height, width = 3, buildingHeight = 2.5) {
        const building = this.createPlane(imagePath, width, buildingHeight, false);
        building.position.set(x, height + buildingHeight/2, z);
        return building;
    }

    // 울타리나 벽
    createFence(x, z, height, direction = 'horizontal') {
        const fence = this.createPlane('/images/fence.png', 1, 0.8, false);
        fence.position.set(x, height + 0.4, z);
        
        if (direction === 'vertical') {
            fence.rotation.y = Math.PI / 2;
        }
        
        return fence;
    }
}

// 사용 예시
const plane3D = new Plane3D();

function addPlaneObject(x, z, type) {
    const height = heightMap[x][z];
    let object;

    switch(type) {
        case 'tree':
            object = plane3D.createCrossTree(x - islandSize/2, z - islandSize/2, height);
            break;
        case 'house':
            object = plane3D.createBuilding('/images/house.png', x - islandSize/2, z - islandSize/2, height);
            break;
        case 'shop':
            object = plane3D.createBuilding('/images/nook_shop.png', x - islandSize/2, z - islandSize/2, height, 4, 3);
            break;
        case 'fence':
            object = plane3D.createFence(x - islandSize/2, z - islandSize/2, height);
            break;
    }

    if (object) {
        scene.add(object);
        island.objects.push(object);
    }
}