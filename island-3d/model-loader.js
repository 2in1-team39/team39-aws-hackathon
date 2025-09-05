// 3D 모델 로더 (GLTFLoader 사용)
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/loaders/GLTFLoader.js';

class ACModelLoader {
    constructor() {
        this.loader = new GLTFLoader();
        this.models = new Map();
        this.loadingPromises = new Map();
    }

    // 모델 로드
    async loadModel(name, path) {
        if (this.models.has(name)) {
            return this.models.get(name).clone();
        }

        if (this.loadingPromises.has(name)) {
            return this.loadingPromises.get(name);
        }

        const promise = new Promise((resolve, reject) => {
            this.loader.load(
                path,
                (gltf) => {
                    this.models.set(name, gltf.scene);
                    resolve(gltf.scene.clone());
                },
                undefined,
                reject
            );
        });

        this.loadingPromises.set(name, promise);
        return promise;
    }

    // 동물의 숲 오브젝트 생성
    async createACObject(type, subtype) {
        const modelPaths = {
            // 건물
            'nook-shop': '/models/buildings/nook_shop.glb',
            'museum': '/models/buildings/museum.glb',
            'resident-services': '/models/buildings/resident_services.glb',
            'house-1': '/models/buildings/house_1.glb',
            'house-2': '/models/buildings/house_2.glb',
            
            // 자연
            'oak-tree': '/models/nature/oak_tree.glb',
            'cedar-tree': '/models/nature/cedar_tree.glb',
            'fruit-tree': '/models/nature/fruit_tree.glb',
            'flowers-red': '/models/nature/flowers_red.glb',
            'flowers-white': '/models/nature/flowers_white.glb',
            'rock-normal': '/models/nature/rock_normal.glb',
            'rock-money': '/models/nature/rock_money.glb',
            
            // 지형
            'cliff-straight': '/models/terrain/cliff_straight.glb',
            'cliff-corner': '/models/terrain/cliff_corner.glb',
            'waterfall': '/models/terrain/waterfall.glb',
            'river-straight': '/models/terrain/river_straight.glb',
            'river-curve': '/models/terrain/river_curve.glb',
            
            // 시설
            'bridge-wooden': '/models/facilities/bridge_wooden.glb',
            'bridge-stone': '/models/facilities/bridge_stone.glb',
            'incline-natural': '/models/facilities/incline_natural.glb',
            'incline-stone': '/models/facilities/incline_stone.glb'
        };

        const modelKey = `${type}-${subtype}`;
        const modelPath = modelPaths[modelKey];

        if (!modelPath) {
            console.warn(`모델을 찾을 수 없습니다: ${modelKey}`);
            return null;
        }

        try {
            const model = await this.loadModel(modelKey, modelPath);
            
            // 모델 설정
            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            return model;
        } catch (error) {
            console.error(`모델 로드 실패: ${modelKey}`, error);
            return null;
        }
    }
}

// 사용 예시
const modelLoader = new ACModelLoader();

// 너굴상점 배치
async function placeNookShop(x, z, height) {
    const shop = await modelLoader.createACObject('nook', 'shop');
    if (shop) {
        shop.position.set(x, height, z);
        shop.scale.set(1, 1, 1);
        scene.add(shop);
    }
}

// 나무 배치
async function placeTree(x, z, height, treeType = 'oak') {
    const tree = await modelLoader.createACObject(treeType, 'tree');
    if (tree) {
        tree.position.set(x, height, z);
        scene.add(tree);
    }
}