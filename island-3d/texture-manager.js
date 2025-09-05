// 동물의 숲 스타일 텍스처 관리
class ACTextureManager {
    constructor() {
        this.textureLoader = new THREE.TextureLoader();
        this.textures = new Map();
    }

    // 텍스처 로드
    loadTexture(name, path) {
        if (this.textures.has(name)) {
            return this.textures.get(name);
        }

        const texture = this.textureLoader.load(path);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.magFilter = THREE.NearestFilter; // 픽셀 아트 스타일
        texture.minFilter = THREE.NearestFilter;
        
        this.textures.set(name, texture);
        return texture;
    }

    // 동물의 숲 스타일 재질 생성
    createACMaterial(type) {
        const materials = {
            // 지형 재질
            grass: () => new THREE.MeshLambertMaterial({
                color: 0x4a7c59,
                map: this.loadTexture('grass', '/textures/terrain/grass.png')
            }),
            
            sand: () => new THREE.MeshLambertMaterial({
                color: 0xc2b280,
                map: this.loadTexture('sand', '/textures/terrain/sand.png')
            }),
            
            cliff: () => new THREE.MeshLambertMaterial({
                map: this.loadTexture('cliff', '/textures/terrain/cliff.png')
            }),
            
            water: () => new THREE.MeshLambertMaterial({
                color: 0x4a90e2,
                transparent: true,
                opacity: 0.8,
                map: this.loadTexture('water', '/textures/terrain/water.png')
            }),
            
            // 건물 재질
            wood: () => new THREE.MeshLambertMaterial({
                map: this.loadTexture('wood', '/textures/materials/wood.png')
            }),
            
            stone: () => new THREE.MeshLambertMaterial({
                map: this.loadTexture('stone', '/textures/materials/stone.png')
            }),
            
            // 자연 재질
            bark: () => new THREE.MeshLambertMaterial({
                map: this.loadTexture('bark', '/textures/nature/bark.png')
            }),
            
            leaves: () => new THREE.MeshLambertMaterial({
                color: 0x228b22,
                map: this.loadTexture('leaves', '/textures/nature/leaves.png')
            })
        };

        return materials[type] ? materials[type]() : new THREE.MeshLambertMaterial({ color: 0xffffff });
    }

    // 계절별 텍스처 변경
    changeSeasonTextures(season) {
        const seasonTextures = {
            spring: {
                grass: '/textures/seasons/spring/grass.png',
                leaves: '/textures/seasons/spring/leaves.png'
            },
            summer: {
                grass: '/textures/seasons/summer/grass.png',
                leaves: '/textures/seasons/summer/leaves.png'
            },
            autumn: {
                grass: '/textures/seasons/autumn/grass.png',
                leaves: '/textures/seasons/autumn/leaves.png'
            },
            winter: {
                grass: '/textures/seasons/winter/snow.png',
                leaves: '/textures/seasons/winter/bare_branches.png'
            }
        };

        // 기존 텍스처 업데이트
        Object.entries(seasonTextures[season]).forEach(([name, path]) => {
            if (this.textures.has(name)) {
                this.textures.delete(name);
            }
            this.loadTexture(name, path);
        });
    }
}

// 사용 예시
const textureManager = new ACTextureManager();

// 동물의 숲 스타일 지형 생성
function createACTerrain(x, z, type, height) {
    const geometry = new THREE.BoxGeometry(1, height + 0.1, 1);
    const material = textureManager.createACMaterial(type);
    const tile = new THREE.Mesh(geometry, material);
    
    tile.position.set(x, height/2, z);
    return tile;
}