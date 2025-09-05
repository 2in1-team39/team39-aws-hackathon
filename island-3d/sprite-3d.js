// 2D 이미지를 3D 공간에 빌보드로 배치
class Sprite3D {
    constructor() {
        this.textureLoader = new THREE.TextureLoader();
    }

    // 2D 이미지로 3D 스프라이트 생성
    createSprite(imagePath, width = 1, height = 1) {
        const texture = this.textureLoader.load(imagePath);
        texture.magFilter = THREE.NearestFilter; // 픽셀 아트 스타일
        texture.minFilter = THREE.NearestFilter;

        const spriteMaterial = new THREE.SpriteMaterial({ 
            map: texture,
            transparent: true,
            alphaTest: 0.5 // 투명도 처리
        });

        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(width, height, 1);
        
        return sprite;
    }

    // 동물의 숲 스타일 나무 생성
    createACTree(x, z, height) {
        const tree = this.createSprite('/images/tree.png', 2, 3);
        tree.position.set(x, height + 1.5, z);
        return tree;
    }

    // 동물의 숲 스타일 집 생성
    createACHouse(x, z, height) {
        const house = this.createSprite('/images/house.png', 3, 2.5);
        house.position.set(x, height + 1.25, z);
        return house;
    }

    // 상점 생성
    createACShop(x, z, height) {
        const shop = this.createSprite('/images/nook_shop.png', 4, 3);
        shop.position.set(x, height + 1.5, z);
        return shop;
    }

    // 꽃 생성
    createACFlower(x, z, height, flowerType = 'tulip') {
        const flower = this.createSprite(`/images/flowers/${flowerType}.png`, 0.5, 0.8);
        flower.position.set(x, height + 0.4, z);
        return flower;
    }
}

// 사용 예시
const sprite3D = new Sprite3D();

function addSpriteObject(x, z, type) {
    const height = heightMap[x][z];
    let object;

    switch(type) {
        case 'tree':
            object = sprite3D.createACTree(x - islandSize/2, z - islandSize/2, height);
            break;
        case 'house':
            object = sprite3D.createACHouse(x - islandSize/2, z - islandSize/2, height);
            break;
        case 'shop':
            object = sprite3D.createACShop(x - islandSize/2, z - islandSize/2, height);
            break;
        case 'flower':
            object = sprite3D.createACFlower(x - islandSize/2, z - islandSize/2, height);
            break;
    }

    if (object) {
        scene.add(object);
        island.objects.push(object);
    }
}