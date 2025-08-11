// 공공데이터 API 설정
const API_CONFIG = {
    baseUrl: 'https://api.odcloud.kr/api/15050912/v1/uddi:0a633058-9843-40fe-93d0-b568f23b715e_201909261047',
    apiKey: 'vkj2dB8n3l4Us1yv5E0f3W6LFFhO8%2BS%2BJ5TYBYVQJfPLMLjj08uRuFdwM329zx%2Bh%2BIbAAVddXWW9pnlewxxUXQ%3D%3D'
};

// API 상태 관리
let apiStatus = 'checking';
let requestCount = 0;
let responseTimes = [];

// 오늘 먹은 음식 관리
let todayFood = JSON.parse(localStorage.getItem('todayFood')) || [];

// DOM 요소들
const elements = {
    foodInput: document.getElementById('foodInput'),
    searchBtn: document.getElementById('searchBtn'),
    searchType: document.getElementById('searchType'),
    resultCount: document.getElementById('resultCount'),
    resultSection: document.getElementById('resultSection'),
    loading: document.getElementById('loading'),
    error: document.getElementById('error'),
    apiInfo: document.getElementById('apiInfo'),
    apiStatus: document.getElementById('apiStatus'),
    quickBtns: document.querySelectorAll('.quick-btn'),
    aboutModal: document.getElementById('aboutModal'),
    aboutLink: document.getElementById('aboutLink'),
    closeModal: document.getElementById('closeModal'),
    
    // 결과 표시 요소들
    foodName: document.getElementById('foodName'),
    calories: document.getElementById('calories'),
    carbs: document.getElementById('carbs'),
    protein: document.getElementById('protein'),
    fat: document.getElementById('fat'),
    sodium: document.getElementById('sodium'),
    category: document.getElementById('category'),
    manufacturer: document.getElementById('manufacturer'),
    servingSize: document.getElementById('servingSize'),
    fiber: document.getElementById('fiber'),
    sugar: document.getElementById('sugar'),
    cholesterol: document.getElementById('cholesterol'),
    calcium: document.getElementById('calcium'),
    iron: document.getElementById('iron'),
    potassium: document.getElementById('potassium'),
    lastUpdated: document.getElementById('lastUpdated'),
    
    // API 정보 요소들
    apiServiceName: document.getElementById('apiServiceName'),
    requestCountElement: document.getElementById('requestCount'),
    responseTimeElement: document.getElementById('responseTime')
};

// 시뮬레이션용 음식 데이터 (API 오류 시 백업용)
const mockFoodDatabase = {
    "김치찌개": {
        name: "김치찌개",
        calories: 320,
        carbs: 15,
        protein: 18,
        fat: 22,
        sodium: 1200,
        category: "한식/찌개류",
        manufacturer: "일반음식점",
        servingSize: "1인분 (300g)",
        fiber: 3,
        sugar: 5,
        cholesterol: 45,
        calcium: 120,
        iron: 2.5,
        potassium: 450
    },
    "치킨": {
        name: "후라이드 치킨",
        calories: 450,
        carbs: 25,
        protein: 35,
        fat: 28,
        sodium: 800,
        category: "패스트푸드/치킨",
        manufacturer: "치킨 프랜차이즈",
        servingSize: "1마리 (800g)",
        fiber: 2,
        sugar: 3,
        cholesterol: 120,
        calcium: 80,
        iron: 3.2,
        potassium: 380
    },
    "피자": {
        name: "페퍼로니 피자",
        calories: 280,
        carbs: 35,
        protein: 12,
        fat: 14,
        sodium: 600,
        category: "패스트푸드/피자",
        manufacturer: "피자 프랜차이즈",
        servingSize: "1조각 (150g)",
        fiber: 2,
        sugar: 4,
        cholesterol: 25,
        calcium: 150,
        iron: 1.8,
        potassium: 220
    },
    "라면": {
        name: "신라면",
        calories: 380,
        carbs: 55,
        protein: 8,
        fat: 15,
        sodium: 1800,
        category: "면류/라면",
        manufacturer: "농심",
        servingSize: "1봉지 (120g)",
        fiber: 3,
        sugar: 2,
        cholesterol: 0,
        calcium: 60,
        iron: 1.5,
        potassium: 180
    },
    "비빔밥": {
        name: "돌솥 비빔밥",
        calories: 420,
        carbs: 65,
        protein: 15,
        fat: 12,
        sodium: 900,
        category: "한식/밥류",
        manufacturer: "한식당",
        servingSize: "1인분 (400g)",
        fiber: 8,
        sugar: 6,
        cholesterol: 0,
        calcium: 180,
        iron: 4.2,
        potassium: 520
    }
};

// API 연결 상태 확인
async function checkApiConnection() {
    try {
        updateApiStatus('checking', 'API 연결 확인 중...');
        
        // 실제 API 연결 테스트
        const testUrl = `${API_CONFIG.baseUrl}?serviceKey=${API_CONFIG.apiKey}&page=1&perPage=1`;
        const response = await fetch(testUrl);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ API 연결 성공:', data);
            updateApiStatus('connected', '공공데이터 API 연결됨');
        } else {
            throw new Error(`API 응답 오류: ${response.status}`);
        }
    } catch (error) {
        console.error('❌ API 연결 실패:', error);
        updateApiStatus('error', 'API 연결 실패 - 시뮬레이션 모드');
        console.log('⚠️ 시뮬레이션 모드로 실행됩니다.');
    }
}

// API 상태 업데이트
function updateApiStatus(status, message) {
    apiStatus = status;
    elements.apiStatus.textContent = message;
    elements.apiStatus.className = `status-indicator ${status}`;
}

// 공공데이터 API 호출
async function callPublicDataAPI(searchTerm, searchType = 'name', resultCount = 20) {
    const startTime = Date.now();
    requestCount++;
    try {
        // 실제 공공데이터 API 호출
        // 검색 파라미터명은 '음식명'으로 사용
        const url = `${API_CONFIG.baseUrl}?serviceKey=${API_CONFIG.apiKey}&page=1&perPage=${resultCount}&음식명=${encodeURIComponent(searchTerm)}`;
        console.log('🔍 API 요청:', url);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API 응답 오류: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        const responseTime = Date.now() - startTime;
        responseTimes.push(responseTime);
        console.log('📊 API 응답:', data);
        updateApiInfo(data);
        return data;
    } catch (error) {
        console.error('❌ API 호출 실패:', error);
        // API 오류 시 시뮬레이션 데이터 사용
        console.log('🔄 시뮬레이션 데이터로 대체합니다.');
        const responseTime = Date.now() - startTime;
        responseTimes.push(responseTime);
        return simulateApiResponse(searchTerm, searchType, resultCount);
    }
}

// 시뮬레이션 API 응답 (백업용)
function simulateApiResponse(searchTerm, searchType, resultCount) {
    const matchingFoods = Object.values(mockFoodDatabase).filter(food => {
        switch (searchType) {
            case 'name':
                return food.name.toLowerCase().includes(searchTerm.toLowerCase());
            case 'category':
                return food.category.toLowerCase().includes(searchTerm.toLowerCase());
            case 'ingredient':
                return food.name.toLowerCase().includes(searchTerm.toLowerCase());
            default:
                return food.name.toLowerCase().includes(searchTerm.toLowerCase());
        }
    });
    
    return {
        currentCount: matchingFoods.length,
        data: matchingFoods.slice(0, resultCount),
        matchCount: matchingFoods.length,
        page: 1,
        perPage: resultCount,
        totalCount: Object.keys(mockFoodDatabase).length
    };
}

// 음식 검색 함수
async function searchFood(searchTerm) {
    if (!searchTerm.trim()) {
        showError('검색어를 입력해주세요.');
        return;
    }
    showLoading();
    try {
        // 전체 데이터 받아오기
        let page = 1;
        let perPage = 100;
        let allData = [];
        let hasMore = true;
        while (hasMore) {
            const url = `${API_CONFIG.baseUrl}?serviceKey=${API_CONFIG.apiKey}&page=${page}&perPage=${perPage}&returnType=JSON`;
            const response = await fetch(url);
            const data = await response.json();
            if (data.data && data.data.length > 0) {
                allData = allData.concat(data.data);
                page++;
                hasMore = data.data.length === perPage;
            } else {
                hasMore = false;
            }
        }
        // 전체 데이터에서 검색어가 포함된 항목 찾기
        const matched = allData.find(item => item["음식명"] && item["음식명"].includes(searchTerm));
        if (matched) {
            displayFoodInfo(matched);
        } else {
            showError('정확히 일치하는 결과가 없습니다.');
        }
    } catch (error) {
        showError('검색 중 오류가 발생했습니다.');
    }
}

// 음식 정보 표시 함수
function displayFoodInfo(foodData) {
    elements.resultSection.style.display = 'block';
    elements.loading.style.display = 'none';
    elements.error.style.display = 'none';
    elements.foodName.textContent = foodData["음식명"] || '정보 없음';
    elements.calories.textContent = foodData["1인분칼로리(kcal)"] || '정보 없음';
    elements.carbs.textContent = foodData["탄수화물(g)"] || '정보 없음';
    elements.protein.textContent = foodData["단백질(g)"] || '정보 없음';
    elements.fat.textContent = foodData["지방(g)"] || '정보 없음';
    elements.sodium.textContent = foodData["나트륨(g)"] || '정보 없음';
    elements.fiber.textContent = foodData["식이섬유(g)"] || '정보 없음';
    elements.cholesterol.textContent = foodData["콜레스트롤(g)"] || '정보 없음';
    elements.lastUpdated.textContent = new Date().toLocaleString('ko-KR');
    elements.resultSection.scrollIntoView({ behavior: 'smooth' });

    // 검색 시 자동으로 오늘 먹은 음식에 추가
    if (todayFood.length < 10) {
        const name = foodData["음식명"] || '정보 없음';
        let cal = foodData["1인분칼로리(kcal)"];
        if (typeof cal === 'string') cal = cal.replace(/[^\d.]/g, '');
        if (!cal) cal = 0;
        todayFood.push({ name, calories: cal });
        saveTodayFood();
        renderTodayFood();
    } else {
        // 10개 초과 시 알림(자동 추가는 안 됨)
        if (!document.getElementById('todayFoodLimitAlert')) {
            const alertDiv = document.createElement('div');
            alertDiv.id = 'todayFoodLimitAlert';
            alertDiv.style.color = '#dc3545';
            alertDiv.style.fontSize = '0.98rem';
            alertDiv.style.margin = '10px 0 0 0';
            alertDiv.textContent = '오늘 먹은 음식은 최대 10개까지 저장할 수 있습니다.';
            elements.resultSection.querySelector('.food-info').appendChild(alertDiv);
            setTimeout(()=>{ alertDiv.remove(); }, 2000);
        }
    }

    // 오늘 먹은 음식에 추가 버튼(기존대로)
    let addBtn = document.getElementById('addTodayFoodBtn');
    if (!addBtn) {
        addBtn = document.createElement('button');
        addBtn.id = 'addTodayFoodBtn';
        addBtn.textContent = '오늘 먹은 음식에 추가';
        addBtn.style.marginTop = '18px';
        addBtn.style.width = '100%';
        addBtn.style.background = '#667eea';
        addBtn.style.color = '#fff';
        addBtn.style.border = 'none';
        addBtn.style.borderRadius = '8px';
        addBtn.style.padding = '12px 0';
        addBtn.style.fontSize = '1.05rem';
        addBtn.style.cursor = 'pointer';
        addBtn.style.fontWeight = '600';
        elements.resultSection.querySelector('.food-info').appendChild(addBtn);
    }
    addBtn.onclick = function() {
        if (todayFood.length >= 10) {
            alert('오늘 먹은 음식은 최대 10개까지 저장할 수 있습니다.');
            return;
        }
        const name = foodData["음식명"] || '정보 없음';
        let cal = foodData["1인분칼로리(kcal)"];
        if (typeof cal === 'string') cal = cal.replace(/[^\d.]/g, '');
        if (!cal) cal = 0;
        todayFood.push({ name, calories: cal });
        saveTodayFood();
        renderTodayFood();
    };
}

// 영양 정보 포맷팅
function formatNutrition(value, unit) {
    if (value === undefined || value === null || value === '') {
        return '정보 없음';
    }
    
    // 숫자가 아닌 경우 숫자만 추출
    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) {
        return '정보 없음';
    }
    
    return `${numericValue}${unit}`;
}

// 로딩 상태 표시
function showLoading() {
    elements.resultSection.style.display = 'none';
    elements.loading.style.display = 'block';
    elements.error.style.display = 'none';
}

// 에러 상태 표시
function showError(message = '음식을 찾을 수 없습니다. 다른 음식명을 입력해보세요.') {
    elements.resultSection.style.display = 'none';
    elements.loading.style.display = 'none';
    elements.error.style.display = 'block';
    
    const errorMessage = elements.error.querySelector('p');
    if (errorMessage) {
        errorMessage.textContent = message;
    }
}

// API 정보 업데이트
function updateApiInfo(apiData) {
    elements.apiInfo.style.display = 'block';
    elements.apiServiceName.textContent = '공공데이터 영양정보 API';
    elements.requestCountElement.textContent = requestCount;
    
    const avgResponseTime = responseTimes.length > 0 
        ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
        : 0;
    elements.responseTimeElement.textContent = `${avgResponseTime}ms`;
}

// 자동완성 기능
function setupAutocomplete() {
    const suggestions = Object.keys(mockFoodDatabase);
    const datalist = document.getElementById('foodSuggestions');
    
    // 기존 옵션 제거
    datalist.innerHTML = '';
    
    // 새로운 옵션 추가
    suggestions.forEach(food => {
        const option = document.createElement('option');
        option.value = food;
        datalist.appendChild(option);
    });
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 검색 버튼 클릭
    elements.searchBtn.addEventListener('click', () => {
        const searchTerm = elements.foodInput.value.trim();
        const searchType = elements.searchType.value;
        const resultCount = parseInt(elements.resultCount.value);
        
        if (searchTerm) {
            searchFood(searchTerm, searchType, resultCount);
        }
    });
    
    // 엔터 키 이벤트
    elements.foodInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const searchTerm = elements.foodInput.value.trim();
            const searchType = elements.searchType.value;
            const resultCount = parseInt(elements.resultCount.value);
            
            if (searchTerm) {
                searchFood(searchTerm, searchType, resultCount);
            }
        }
    });
    
    // 빠른 검색 버튼
    elements.quickBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const food = btn.getAttribute('data-food');
            elements.foodInput.value = food;
            searchFood(food);
        });
    });
    
    // 입력 필드 포커스 시 자동 선택
    elements.foodInput.addEventListener('focus', () => {
        elements.foodInput.select();
    });
    
    // 모달 다이얼로그
    elements.aboutLink.addEventListener('click', (e) => {
        e.preventDefault();
        elements.aboutModal.showModal();
    });
    
    elements.closeModal.addEventListener('click', () => {
        elements.aboutModal.close();
    });
    
    // 모달 외부 클릭 시 닫기
    elements.aboutModal.addEventListener('click', (e) => {
        if (e.target === elements.aboutModal) {
            elements.aboutModal.close();
        }
    });
}

// 페이지 초기화
async function initializeApp() {
    console.log('🍽️ 칼로리 계산기 초기화 중...');
    
    // API 연결 확인
    await checkApiConnection();
    
    // 자동완성 설정
    setupAutocomplete();
    
    // 이벤트 리스너 설정
    setupEventListeners();
    
    // 입력 필드에 포커스
    elements.foodInput.focus();
    
    // 오늘 먹은 음식 렌더링
    renderTodayFood();
    
    console.log('✅ 앱 초기화 완료');
    console.log('🔑 API 키 설정됨:', API_CONFIG.apiKey ? '예' : '아니오');
    console.log('📋 백업 음식 데이터:', Object.keys(mockFoodDatabase).join(', '));
}

// 페이지 로드 시 초기화
window.addEventListener('load', initializeApp);

// 서비스 워커 등록 (PWA 지원)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW 등록 성공:', registration);
            })
            .catch(registrationError => {
                console.log('SW 등록 실패:', registrationError);
            });
    });
}

// 오프라인 지원
window.addEventListener('online', () => {
    updateApiStatus('connected', '온라인 연결됨');
});

window.addEventListener('offline', () => {
    updateApiStatus('error', '오프라인 모드');
});

// 키보드 단축키
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K로 검색창 포커스
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        elements.foodInput.focus();
    }
    
    // Escape로 모달 닫기
    if (e.key === 'Escape') {
        elements.aboutModal.close();
    }
});

function saveTodayFood() {
    localStorage.setItem('todayFood', JSON.stringify(todayFood));
}

function renderTodayFood() {
    const list = document.getElementById('todayFoodList');
    const totalEl = document.getElementById('totalCalories');
    list.innerHTML = '';
    let total = 0;
    todayFood.forEach((item, idx) => {
        const li = document.createElement('li');
        const name = document.createElement('span');
        name.className = 'food-name';
        name.textContent = item.name;
        const cal = document.createElement('span');
        cal.className = 'food-calories';
        cal.textContent = `${item.calories} kcal`;
        const btn = document.createElement('button');
        btn.className = 'remove-btn';
        btn.textContent = '삭제';
        btn.onclick = () => {
            todayFood.splice(idx, 1);
            saveTodayFood();
            renderTodayFood();
        };
        li.appendChild(name);
        li.appendChild(cal);
        li.appendChild(btn);
        list.appendChild(li);
        const c = parseFloat(item.calories);
        if (!isNaN(c)) total += c;
    });
    totalEl.textContent = total;
}

document.getElementById('clearTodayFoodBtn').onclick = function() {
    if (todayFood.length === 0) return;
    if (confirm('오늘 먹은 음식 목록을 모두 삭제할까요?')) {
        todayFood = [];
        saveTodayFood();
        renderTodayFood();
    }
}; 