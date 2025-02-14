module.exports = {
    'env': {
        'node': true,
        'es2021': true
    },
    'extends': 'eslint:recommended',
    'parserOptions': {
        'ecmaVersion': 13,
        'sourceType': 'module'
    },
    'rules': {
        'quotes': ['error', 'single', { 'allowTemplateLiterals': true }]
    }
};
