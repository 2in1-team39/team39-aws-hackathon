// Nookipedia API를 활용한 동물의 숲 데이터 관리
class NookipediaAPI {
    constructor() {
        this.baseURL = 'https://api.nookipedia.com';
        this.headers = {
            'X-API-KEY': 'YOUR_API_KEY', // API 키 필요
            'Accept-Version': '1.0.0'
        };
        this.cache = new Map();
    }

    // 주민 데이터 가져오기
    async getVillagers(limit = 50) {
        const cacheKey = `villagers_${limit}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            const response = await fetch(`${this.baseURL}/villagers?limit=${limit}`, {
                headers: this.headers
            });
            const villagers = await response.json();
            this.cache.set(cacheKey, villagers);
            return villagers;
        } catch (error) {
            console.error('주민 데이터 로드 실패:', error);
            return [];
        }
    }

    // 가구 데이터 가져오기
    async getFurniture(category = null, limit = 100) {
        const cacheKey = `furniture_${category}_${limit}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            let url = `${this.baseURL}/nh/items?limit=${limit}`;
            if (category) {
                url += `&category=${category}`;
            }
            
            const response = await fetch(url, { headers: this.headers });
            const furniture = await response.json();
            this.cache.set(cacheKey, furniture);
            return furniture;
        } catch (error) {
            console.error('가구 데이터 로드 실패:', error);
            return [];
        }
    }

    // 물고기 데이터 가져오기
    async getFish() {
        if (this.cache.has('fish')) {
            return this.cache.get('fish');
        }

        try {
            const response = await fetch(`${this.baseURL}/nh/fish`, {
                headers: this.headers
            });
            const fish = await response.json();
            this.cache.set('fish', fish);
            return fish;
        } catch (error) {
            console.error('물고기 데이터 로드 실패:', error);
            return [];
        }
    }

    // 곤충 데이터 가져오기
    async getBugs() {
        if (this.cache.has('bugs')) {
            return this.cache.get('bugs');
        }

        try {
            const response = await fetch(`${this.baseURL}/nh/bugs`, {
                headers: this.headers
            });
            const bugs = await response.json();
            this.cache.set('bugs', bugs);
            return bugs;
        } catch (error) {
            console.error('곤충 데이터 로드 실패:', error);
            return [];
        }
    }

    // 꽃 데이터 가져오기
    async getFlowers() {
        if (this.cache.has('flowers')) {
            return this.cache.get('flowers');
        }

        try {
            const response = await fetch(`${this.baseURL}/nh/flowers`, {
                headers: this.headers
            });
            const flowers = await response.json();
            this.cache.set('flowers', flowers);
            return flowers;
        } catch (error) {
            console.error('꽃 데이터 로드 실패:', error);
            return [];
        }
    }
}

// 3D 오브젝트 생성기 (API 데이터 활용)
class ACObjectGenerator {
    constructor() {
        this.api = new NookipediaAPI();
        this.textureLoader = new THREE.TextureLoader();
        this.loadedVillagers = [];
        this.loadedFurniture = [];
    }

    // 초기 데이터 로드
    async initialize() {
        console.log('Nookipedia 데이터 로딩 중...');
        
        try {
            this.loadedVillagers = await this.api.getVillagers(20);
            this.loadedFurniture = await this.api.getFurniture('Housewares', 50);
            
            console.log(`주민 ${this.loadedVillagers.length}명 로드됨`);
            console.log(`가구 ${this.loadedFurniture.length}개 로드됨`);
        } catch (error) {
            console.error('데이터 로드 실패:', error);
        }
    }

    // 랜덤 주민 스프라이트 생성
    createRandomVillager(x, z, height) {
        if (this.loadedVillagers.length === 0) return null;

        const randomVillager = this.loadedVillagers[Math.floor(Math.random() * this.loadedVillagers.length)];
        
        // 주민 이미지로 스프라이트 생성
        const texture = this.textureLoader.load(randomVillager.image_url);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;

        const spriteMaterial = new THREE.SpriteMaterial({ 
            map: texture,
            transparent: true 
        });

        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(1.5, 2, 1);
        sprite.position.set(x, height + 1, z);
        sprite.userData = {
            type: 'villager',
            name: randomVillager.name,
            species: randomVillager.species,
            personality: randomVillager.personality
        };

        return sprite;
    }

    // 가구 오브젝트 생성
    createFurnitureObject(x, z, height, furnitureType = null) {
        if (this.loadedFurniture.length === 0) return null;

        let furniture;
        if (furnitureType) {
            furniture = this.loadedFurniture.find(item => 
                item.name.toLowerCase().includes(furnitureType.toLowerCase())
            );
        }
        
        if (!furniture) {
            furniture = this.loadedFurniture[Math.floor(Math.random() * this.loadedFurniture.length)];
        }

        // 가구 이미지로 평면 메시 생성
        const texture = this.textureLoader.load(furniture.image_url);
        const geometry = new THREE.PlaneGeometry(1, 1);
        const material = new THREE.MeshLambertMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.5
        });

        const furnitureObj = new THREE.Mesh(geometry, material);
        furnitureObj.position.set(x, height + 0.5, z);
        furnitureObj.userData = {
            type: 'furniture',
            name: furniture.name,
            category: furniture.category,
            price: furniture.sell_price
        };

        return furnitureObj;
    }

    // 주민 정보 UI 생성
    createVillagerInfoPanel(villager) {
        return `
            <div style="background: rgba(255,255,255,0.9); padding: 15px; border-radius: 10px; margin: 10px;">
                <h3>${villager.userData.name}</h3>
                <p><strong>종족:</strong> ${villager.userData.species}</p>
                <p><strong>성격:</strong> ${villager.userData.personality}</p>
            </div>
        `;
    }
}

// 사용 예시
const objectGenerator = new ACObjectGenerator();

// 초기화
async function initializeNookipediaData() {
    await objectGenerator.initialize();
    console.log('Nookipedia 데이터 로드 완료!');
}

// 주민 배치
function placeRandomVillager(x, z) {
    const height = heightMap[x][z];
    const villager = objectGenerator.createRandomVillager(
        x - islandSize/2, 
        z - islandSize/2, 
        height
    );
    
    if (villager) {
        scene.add(villager);
        island.objects.push(villager);
        
        // 클릭 이벤트로 주민 정보 표시
        villager.onClick = () => {
            const infoPanel = document.getElementById('villager-info');
            if (infoPanel) {
                infoPanel.innerHTML = objectGenerator.createVillagerInfoPanel(villager);
            }
        };
    }
}

// 가구 배치
function placeFurniture(x, z, type = null) {
    const height = heightMap[x][z];
    const furniture = objectGenerator.createFurnitureObject(
        x - islandSize/2, 
        z - islandSize/2, 
        height,
        type
    );
    
    if (furniture) {
        scene.add(furniture);
        island.objects.push(furniture);
    }
}

// 페이지 로드 시 데이터 초기화
document.addEventListener('DOMContentLoaded', () => {
    initializeNookipediaData();
});