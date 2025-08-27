const jwt = require('jsonwebtoken');
require('dotenv').config();

// 调试JWT认证问题
function debugJWT() {
  console.log('=== JWT 认证调试工具 ===');
  
  // 检查环境变量
  console.log('\n1. 环境变量检查:');
  console.log('TOKEN_SECRET:', process.env.TOKEN_SECRET ? '已设置' : '未设置');
  console.log('TOKEN_SECRET长度:', process.env.TOKEN_SECRET?.length || 0);
  
  // 检查JWT配置
  console.log('\n2. JWT配置检查:');
  const secret = process.env.TOKEN_SECRET;
  if (!secret) {
    console.error('❌ TOKEN_SECRET 未设置！');
    return;
  }
  
  // 测试JWT签名和验证
  console.log('\n3. JWT签名测试:');
  const testPayload = {
    username: 'testuser',
    sub: 1,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (100 * 24 * 60 * 60) // 100天
  };
  
  try {
    const token = jwt.sign(testPayload, secret);
    console.log('✅ JWT签名成功');
    console.log('测试Token:', token.substring(0, 50) + '...');
    
    // 验证token
    const decoded = jwt.verify(token, secret);
    console.log('✅ JWT验证成功');
    console.log('解码结果:', decoded);
    
  } catch (error) {
    console.error('❌ JWT操作失败:', error.message);
  }
  
  // 角色检查
  console.log('\n4. 角色定义检查:');
  const roles = {
    'ADMIN': 'ADMIN',
    'CZ_MEMBER': 'CZ_MEMBER', 
    'COMMON': 'COMMON'
  };
  
  console.log('数据库中的角色值:');
  Object.entries(roles).forEach(([key, value]) => {
    console.log(`  ${key}: "${value}"`);
  });
  
  console.log('\n5. 权限检查逻辑:');
  console.log('RoleGuard检查: user.role === "ADMIN"');
  console.log('枚举定义: Role.ADMIN = "ADMIN"');
  
  console.log('\n=== 调试完成 ===');
}

// 如果直接运行此脚本
if (require.main === module) {
  debugJWT();
}

module.exports = { debugJWT }; 