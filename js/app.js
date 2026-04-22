/**
 * Marriage Platform H5 App
 * Main Logic: Data Loading, Filter, Card Rendering
 */

// Global State
let currentFilters = {};
let allGuests = [];
let filteredGuests = [];

// DOM Elements
const guestList = document.getElementById('guestList');
const cardsContainer = document.getElementById('cardsContainer');
const loadingState = document.getElementById('loadingState');
const totalCount = document.getElementById('totalCount');
const filterModal = document.getElementById('filterModal');
const mask = document.getElementById('mask');
const openFilter = document.getElementById('openFilter');
const closeFilter = document.getElementById('closeFilter');
const confirmFilter = document.getElementById('confirmFilter');
const resetFilter = document.getElementById('resetFilter');

/**
 * Initialize App
 */
async function init() {
    showLoading(true);
    
    try {
        // Load Data
        if (CONFIG.USE_MOCK_DATA) {
            console.log('Using mock data mode');
            allGuests = CONFIG.MOCK_DATA;
        } else {
            console.log('Using Feishu API mode');
            allGuests = await feishuAPI.getAllRecords(
                CONFIG.BITABLE_APP_TOKEN,
                CONFIG.BITABLE_TABLE_ID
            );
        }
        
        filteredGuests = [...allGuests];
        
        console.log('Total guests loaded:', filteredGuests.length);
        console.log('Sample guest fields:', filteredGuests[0]?.fields);
        
        // Render Guest List
        renderGuestList();
        
        // Update Count
        updateCount();
        
        // Initialize Sliders
        initAgeSlider();
        initHeightSlider();
        
        // Initialize Filter Tabs
        initFilterTabs();
        
    } catch (error) {
        console.error('Init failed:', error);
        showError('Data load failed');
    } finally {
        showLoading(false);
    }
}

/**
 * Initialize Filter Tabs
 */
function initFilterTabs() {
    const tabs = document.querySelectorAll('.filter-tab');
    const groups = document.querySelectorAll('.filter-group');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const groupId = tab.dataset.group;
            
            // Update tab active state
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show corresponding group
            groups.forEach(g => g.style.display = 'none');
            document.getElementById('group-' + groupId).style.display = 'block';
        });
    });
}

/**
 * Initialize Age Range Slider (18-50)
 */
function initAgeSlider() {
    const ageMinSlider = document.getElementById('ageMin');
    const ageMaxSlider = document.getElementById('ageMax');
    const ageMinValue = document.getElementById('ageMinValue');
    const ageMaxValue = document.getElementById('ageMaxValue');
    const ageFill = document.getElementById('ageFill');
    
    function updateAgeSlider() {
        let min = parseInt(ageMinSlider.value);
        let max = parseInt(ageMaxSlider.value);
        
        if (min > max) {
            if (this === ageMinSlider) {
                ageMaxSlider.value = min;
                max = min;
            } else {
                ageMinSlider.value = max;
                min = max;
            }
        }
        
        ageMinValue.textContent = min + '岁';
        ageMaxValue.textContent = max + '岁';
        
        const range = 50 - 18;
        const leftPercent = ((min - 18) / range) * 100;
        const rightPercent = ((50 - max) / range) * 100;
        ageFill.style.left = leftPercent + '%';
        ageFill.style.right = rightPercent + '%';
    }
    
    ageMinSlider.addEventListener('input', updateAgeSlider);
    ageMaxSlider.addEventListener('input', updateAgeSlider);
    updateAgeSlider();
}

/**
 * Initialize Height Range Slider (150-190)
 */
function initHeightSlider() {
    const heightMinSlider = document.getElementById('heightMin');
    const heightMaxSlider = document.getElementById('heightMax');
    const heightMinValue = document.getElementById('heightMinValue');
    const heightMaxValue = document.getElementById('heightMaxValue');
    const heightFill = document.getElementById('heightFill');
    
    function updateHeightSlider() {
        let min = parseInt(heightMinSlider.value);
        let max = parseInt(heightMaxSlider.value);
        
        if (min > max) {
            if (this === heightMinSlider) {
                heightMaxSlider.value = min;
                max = min;
            } else {
                heightMinSlider.value = max;
                min = max;
            }
        }
        
        if (min === 150) {
            heightMinValue.textContent = '不限';
        } else {
            heightMinValue.textContent = min + 'cm+';
        }
        
        if (max === 190) {
            heightMaxValue.textContent = '不限';
        } else {
            heightMaxValue.textContent = max + 'cm以下';
        }
        
        const range = 190 - 150;
        const leftPercent = ((min - 150) / range) * 100;
        const rightPercent = ((190 - max) / range) * 100;
        heightFill.style.left = leftPercent + '%';
        heightFill.style.right = rightPercent + '%';
    }
    
    heightMinSlider.addEventListener('input', updateHeightSlider);
    heightMaxSlider.addEventListener('input', updateHeightSlider);
    updateHeightSlider();
}

/**
 * Show/Hide Loading
 */
function showLoading(show) {
    loadingState.style.display = show ? 'flex' : 'none';
}

/**
 * Show Error Message
 */
function showError(message) {
    cardsContainer.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">😢</div>
            <div class="empty-text">${message}</div>
        </div>
    `;
}

/**
 * Render Guest Card List
 */
function renderGuestList() {
    if (filteredGuests.length === 0) {
        cardsContainer.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-icon">💔</div>
                <p style="color: #ff6b6b; font-size: 16px; margin-bottom: 8px;">暂无符合条件的嘉宾</p>
                <p style="color: #999; font-size: 14px;">要求太严格<br>可不太好脱单哦</p>
            </div>
        `;
        return;
    }
    
    const mapping = CONFIG.FIELD_MAPPING;
    
    cardsContainer.innerHTML = filteredGuests.map(guest => {
        const fields = guest.fields;
        
        const id = guest.record_id || fields[mapping.id] || '';
        const name = fields[mapping.name] || 'Anonymous';
        const gender = fields[mapping.gender] || '';
        const age = fields[mapping.age] || '';
        const height = fields[mapping.height] || '';
        const weight = fields[mapping.weight] || '';
        const education = fields[mapping.education] || '';
        const income = fields[mapping.income] || '';
        const profileUrl = fields[mapping.profileUrl] || generateProfileUrl(id, name, gender, age);
        
        // 第二行：年龄 · 身高 · 体重
        const detailParts = [];
        if (age) detailParts.push(age + '岁');
        if (height) detailParts.push(height + 'cm');
        if (weight) detailParts.push(weight + 'kg');
        
        // 第三行标签：学历 · 收入区间（用 span.tag 包裹以应用统一样式）
        const tags = [];
        if (education) tags.push(`<span class="tag">${education}</span>`);
        if (income) tags.push(`<span class="tag">${income}</span>`);
        const tagsHtml = tags.join('<span class="tag-separator"> · </span>');
        
        // 处理头像：优先使用本地图片（images/ID.png），无则显示名字首字母
        const avatarContent = id 
            ? `<img src="images/${id}.png" alt="${name}" onerror="this.parentElement.textContent='${name.charAt(0)}'; this.remove();" />`
            : name.charAt(0);
        
        return `
            <div class="guest-card" onclick="goToProfile('${profileUrl}')">
                <div class="card-avatar ${gender === '女' ? 'female' : 'male'}">
                    ${avatarContent}
                </div>
                <div class="card-info">
                    <div class="card-name">
                        ${name}
                        <span class="card-gender ${gender === '女' ? 'female' : 'male'}">
                            ${gender === '女' ? '♀' : '♂'}
                        </span>
                    </div>
                    <div class="card-detail">
                        ${detailParts.join(' · ')}
                    </div>
                    <div class="card-tags">
                        ${tagsHtml}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Generate Profile URL
 */
function generateProfileUrl(id, name, gender, age) {
    let url = CONFIG.PROFILE_URL;
    url = url.replace('{id}', encodeURIComponent(id));
    url = url.replace('{name}', encodeURIComponent(name));
    url = url.replace('{gender}', encodeURIComponent(gender));
    url = url.replace('{age}', encodeURIComponent(age));
    return url;
}

/**
 * Navigate to Profile Page
 */
function goToProfile(url) {
    window.location.href = url;
}

/**
 * Update Count
 */
function updateCount() {
    totalCount.textContent = '共 ' + filteredGuests.length + ' 位嘉宾';
}

/**
 * Open Filter Modal
 */
function openFilterModal() {
    filterModal.classList.add('show');
    mask.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Restore chip states from currentFilters
    restoreFilterStates();
}

/**
 * Restore filter chip states from currentFilters
 */
function restoreFilterStates() {
    // Reset all chips first
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.remove('active');
    });
    
    // Set default for single-select groups (性别)
    const genderChips = document.querySelectorAll('[data-field="性别"]');
    genderChips.forEach(chip => {
        if (chip.dataset.value === '') {
            chip.classList.add('active');
        }
    });
    
    // Restore multi-select chips
    for (const [fieldName, filterValue] of Object.entries(currentFilters)) {
        if (Array.isArray(filterValue)) {
            filterValue.forEach(val => {
                const chip = document.querySelector(`.filter-chip[data-field="${fieldName}"][data-value="${val}"]`);
                if (chip) {
                    chip.classList.add('active');
                }
            });
        } else if (typeof filterValue === 'object' && filterValue !== null) {
            // Range filters (age, height)
            if (filterValue.min !== undefined) {
                const minSlider = document.getElementById(fieldName === '年龄' ? 'ageMin' : 'heightMin');
                if (minSlider) minSlider.value = filterValue.min;
            }
            if (filterValue.max !== undefined) {
                const maxSlider = document.getElementById(fieldName === '年龄' ? 'ageMax' : 'heightMax');
                if (maxSlider) maxSlider.value = filterValue.max;
            }
        } else if (filterValue) {
            // Single value (非空字符串)
            const chip = document.querySelector(`.filter-chip[data-field="${fieldName}"][data-value="${filterValue}"]`);
            if (chip) {
                chip.classList.add('active');
            }
        }
    }
    
    // Update slider displays
    updateSliderDisplays();
}

/**
 * Update slider value displays
 */
function updateSliderDisplays() {
    // Age slider
    const ageMin = document.getElementById('ageMin');
    const ageMax = document.getElementById('ageMax');
    const ageMinValue = document.getElementById('ageMinValue');
    const ageMaxValue = document.getElementById('ageMaxValue');
    const ageFill = document.getElementById('ageFill');
    
    if (ageMin && ageMax) {
        const min = parseInt(ageMin.value);
        const max = parseInt(ageMax.value);
        ageMinValue.textContent = min + '岁';
        ageMaxValue.textContent = max + '岁';
        const range = 50 - 18;
        ageFill.style.left = ((min - 18) / range) * 100 + '%';
        ageFill.style.right = ((50 - max) / range) * 100 + '%';
    }
    
    // Height slider
    const heightMin = document.getElementById('heightMin');
    const heightMax = document.getElementById('heightMax');
    const heightMinValue = document.getElementById('heightMinValue');
    const heightMaxValue = document.getElementById('heightMaxValue');
    const heightFill = document.getElementById('heightFill');
    
    if (heightMin && heightMax) {
        const min = parseInt(heightMin.value);
        const max = parseInt(heightMax.value);
        heightMinValue.textContent = min === 150 ? '不限' : min + 'cm+';
        heightMaxValue.textContent = max === 190 ? '不限' : max + 'cm以下';
        const range = 190 - 150;
        heightFill.style.left = ((min - 150) / range) * 100 + '%';
        heightFill.style.right = ((190 - max) / range) * 100 + '%';
    }
}

/**
 * Close Filter Modal
 */
function closeFilterModal() {
    filterModal.classList.remove('show');
    mask.classList.remove('show');
    document.body.style.overflow = '';
}

/**
 * Apply Filters - 收集所有筛选条件
 */
function applyFilters() {
    currentFilters = {};
    
    // Process all filter chips
    const chips = document.querySelectorAll('.filter-chip');
    chips.forEach(chip => {
        const field = chip.dataset.field;
        const value = chip.dataset.value;
        const parent = chip.parentElement;
        
        if (parent.classList.contains('multi-select')) {
            // Multi-select: collect all selected values into array
            if (!currentFilters[field]) {
                currentFilters[field] = [];
            }
            if (chip.classList.contains('active') && value) {
                currentFilters[field].push(value);
            }
        } else {
            // Single-select
            if (chip.classList.contains('active') && value !== '') {
                currentFilters[field] = value;
            }
        }
    });
    
    // Age range slider
    const ageMin = parseInt(document.getElementById('ageMin').value);
    const ageMax = parseInt(document.getElementById('ageMax').value);
    currentFilters['年龄'] = { min: ageMin, max: ageMax };
    
    // Height range slider
    const heightMin = parseInt(document.getElementById('heightMin').value);
    const heightMax = parseInt(document.getElementById('heightMax').value);
    currentFilters['身高'] = { min: heightMin, max: heightMax };
    
    console.log('Applying filters:', currentFilters);
    
    filterGuests();
    closeFilterModal();
}

/**
 * Reset Filters
 */
function resetFilters() {
    // Reset all chips
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.remove('active');
    });
    
    // Reset single-select (性别) to default
    document.querySelectorAll('[data-field="性别"]').forEach(chip => {
        if (chip.dataset.value === '') {
            chip.classList.add('active');
        }
    });
    
    // Reset age sliders
    document.getElementById('ageMin').value = 18;
    document.getElementById('ageMax').value = 50;
    
    // Reset height sliders
    document.getElementById('heightMin').value = 150;
    document.getElementById('heightMax').value = 190;
    
    updateSliderDisplays();
    
    currentFilters = {};
    filterGuests();
    closeFilterModal();
}

/**
 * Filter Guests - 多选使用OR逻辑（满足任一选项即可）
 * 精确匹配CSV值
 */
function filterGuests() {
    console.log('Filtering guests with filters:', currentFilters);
    console.log('Available guests:', allGuests.length);
    
    filteredGuests = allGuests.filter(guest => {
        const fields = guest.fields;
        
        for (const [fieldName, filterValue] of Object.entries(currentFilters)) {
            // Skip if no filter value
            if (filterValue === undefined || filterValue === null) continue;
            
            // Handle range filters (年龄, 身高)
            if (typeof filterValue === 'object' && (filterValue.min !== undefined || filterValue.max !== undefined)) {
                const fieldValue = fields[fieldName];
                const numValue = parseInt(fieldValue);
                
                if (fieldName === '年龄') {
                    if (!isNaN(numValue)) {
                        if (numValue < filterValue.min || numValue > filterValue.max) {
                            console.log(`Age filter: ${numValue} not in range [${filterValue.min}-${filterValue.max}]`);
                            return false;
                        }
                    }
                } else if (fieldName === '身高') {
                    if (!isNaN(numValue)) {
                        if (numValue < filterValue.min || numValue > filterValue.max) {
                            console.log(`Height filter: ${numValue} not in range [${filterValue.min}-${filterValue.max}]`);
                            return false;
                        }
                    }
                }
                continue;
            }
            
            // Handle single value (性别)
            if (typeof filterValue === 'string') {
                if (filterValue === '') continue; // 空字符串表示"全部"，跳过
                const fieldValue = String(fields[fieldName] || '');
                if (fieldValue !== filterValue) {
                    console.log(`Single filter: "${fieldName}" = "${fieldValue}" !== "${filterValue}"`);
                    return false;
                }
                continue;
            }
            
            // Handle array (多选) - 使用OR逻辑
            if (Array.isArray(filterValue)) {
                // 如果没有选择任何值，跳过此筛选
                if (filterValue.length === 0) continue;
                
                const fieldValue = String(fields[fieldName] || '');
                // 空值：如果用户选择了某些值，但CSV中为空，则不匹配
                if (fieldValue === '') {
                    console.log(`Empty field "${fieldName}" doesn't match any of [${filterValue.join(', ')}]`);
                    return false;
                }
                // OR逻辑：字段值只要匹配任意一个选中的值即可
                const match = filterValue.some(val => fieldValue === String(val));
                if (!match) {
                    console.log(`Multi-select filter: "${fieldName}" = "${fieldValue}" not in [${filterValue.join(', ')}]`);
                    return false;
                }
            }
        }
        
        return true;
    });
    
    console.log('Filtered results:', filteredGuests.length);
    
    renderGuestList();
    updateCount();
}

// Bind Events
openFilter.addEventListener('click', openFilterModal);
closeFilter.addEventListener('click', closeFilterModal);
mask.addEventListener('click', closeFilterModal);
confirmFilter.addEventListener('click', applyFilters);
resetFilter.addEventListener('click', resetFilters);

// Filter chip toggle
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-chip')) {
        const chip = e.target;
        const parent = chip.parentElement;
        
        if (parent.classList.contains('multi-select')) {
            // Multi-select: toggle without affecting others
            chip.classList.toggle('active');
        } else {
            // Single-select
            parent.querySelectorAll('.filter-chip').forEach(c => {
                c.classList.remove('active');
            });
            chip.classList.add('active');
        }
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', init);
