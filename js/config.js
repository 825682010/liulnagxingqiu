/**
 * Config File
 * Marriage Platform H5
 */

const CONFIG = {
    // Feishu App Credentials
    FEISHU_APP_ID: 'cli_a96207922c385cb2',
    FEISHU_APP_SECRET: 'wHD1cjk7yKWeIhAgbAxQOdRFkZkclNOa',

    // Bitable Info
    BITABLE_APP_TOKEN: 'AQISw5Oxpif7Z8kqoyDcMn1AnPf',
    BITABLE_TABLE_ID: 'tblYntXu8SIEmZhW',

    // WeChat Official Account Redirect URL
    PROFILE_URL: 'https://mp.weixin.qq.com/s/dg4pNopbbBZYVswrP3Zf3A?uid={id}&name={name}',

    // Development Mode
    // true: use mock data
    // false: connect to Feishu Bitable
    USE_MOCK_DATA: true,

    // Field Mapping (Feishu field names)
    FIELD_MAPPING: {
        id: '会员ID',
        name: '昵称',
        avatar: '首图',
        gender: '性别',
        age: '年龄',
        height: '身高',
        weight: '体重',
        education: '学历',
        school: '院校',
        industry: '行业',
        occupation: '职业',
        region: '现居地',
        hometown: '籍贯',
        income: '年收入',
        property: '房产情况',
        car: '车产情况',
        marriageStatus: '婚姻状态',
        children: '生育规划',
        intro: '自我介绍',
        profileUrl: '公众号资料链接'
    },

    // Filter Configuration
    FILTERS: {
        gender: {
            field: '性别',
            type: 'radio',
            options: ['男', '女']
        },
        age: {
            field: '年龄',
            type: 'range',
            min: 18,
            max: 50
        },
        height: {
            field: '身高',
            type: 'range',
            min: 150,
            max: 190
        },
        education: {
            field: '学历',
            type: 'multi',
            options: ['大专', '本科', '硕士', '博士']
        },
        income: {
            field: '年收入',
            type: 'multi',
            options: ['10万以下', '10-20万', '20-30万', '30-50万', '50万以上']
        },
        property: {
            field: '房产情况',
            type: 'multi',
            options: ['有房 · 无贷', '有房 · 有贷', '无房 · 计划购房', '无房 · 暂不考虑购房', '无房，期望双方共同购买', '与父母同住']
        },
        car: {
            field: '车产情况',
            type: 'multi',
            options: ['有车', '无车 · 计划购车', '无车 · 暂不考虑购车']
        },
        marriageStatus: {
            field: '婚姻状态',
            type: 'multi',
            options: ['未婚', '离异 · 不带娃', '离异 · 带娃', '丧偶']
        }
    },

    // Mock Data - 真实数据
    MOCK_DATA: [
        {
            record_id: '00001',
            fields: {
                '会员ID': '00001',
                '昵称': '小秋',
                '性别': '女',
                '年龄': 33,
                '身高': 157,
                '体重': 54,
                '学历': '本科',
                '院校': '中山大学',
                '行业': '公立医院',
                '职业': '医务人员',
                '现居地': '广州',
                '籍贯': '梅州',
                '年收入': '20-30万',
                '房产情况': '有房 · 有贷',
                '车产情况': '无车 · 暂不考虑购车',
                '婚姻状态': '未婚',
                '婚姻预期': '希望1-2年结婚',
                '生育规划': '期望要小孩',
                '首图': '00001.png',
                '公众号资料链接': 'https://mp.weixin.qq.com/s/dg4pNopbbBZYVswrP3Zf3A'
            }
        },
        {
            record_id: '00002',
            fields: {
                '会员ID': '00002',
                '昵称': '心向',
                '性别': '男',
                '年龄': 28,
                '身高': 170,
                '体重': 65,
                '学历': '本科',
                '院校': '湖北理工学院',
                '行业': '新能源',
                '职业': '物资管理经理',
                '现居地': '广州黄埔',
                '籍贯': '湖北红安县',
                '年收入': '20-30万',
                '房产情况': '有房 · 无贷',
                '车产情况': '无车 · 计划购车',
                '婚姻状态': '未婚',
                '婚姻预期': '希望1年内结婚',
                '生育规划': '倾向要小孩，但可以商量',
                '首图': '00002.png',
                '公众号资料链接': 'https://mp.weixin.qq.com/s/DnBxeZRWKkRkv51q9raUmA'
            }
        }
    ]
};
