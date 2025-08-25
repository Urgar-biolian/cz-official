// // server.js (后端)
// import express from 'express';
// import mysql from 'mysql2/promise';
// import cors from 'cors';
// import multer from 'multer';
// const upload = multer({ dest: 'uploads/' }); // 配置文件存储目录

// // 修改文件上传接口，使用 multer 中间件

// const app = express();
// app.use(cors({
//   origin: '*', // 允许所有域名
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   credentials: true // 如需携带 Cookie
// })); // 解决跨域问题
// app.use(express.json());
// // nodemon
// // 数据库连接配置
// const pool = mysql.createPool({
//   host: '127.0.0.1',
//   port: 3306,
//   user: 'root',
//   password: '130424z',  
//   database: 'cz_official',
//   waitForConnections: true,
//   connectionLimit: 10,
//   namedPlaceholders: true // 启用命名占位符
// });
// // 测试数据库连接
// async function testDbConnection() {
//   try {
//     const connection = await pool.getConnection();
//     console.log('数据库连接成功');
//     connection.release();
//   } catch (error) {
//     console.error('数据库连接失败:', error);
//     process.exit(1); // 连接失败时终止服务
//   }
// }


// //:id为动态参数
// app.get('/test', (req, res) => {

//   res.send("html");
// })
// // 获取评论列表 API
// app.get('/api/comments', async (req, res) => {
//   try {
//     const { parent_id, include_deleted } = req.query;
//     let sql = 'SELECT * FROM comments WHERE 1=1';
//     const values = [];

//     // if (blog_id) {
//     //   const numBlogId = Number(blog_id);
//     //   if (isNaN(numBlogId) || blog_id.trim() === '') { // 新增空字符串校验
//     //     return res.status(400).json({ error: 'blog_id 必须为有效数字' });
//     //   }
//     //   sql += ' AND blog_id = ?';
//     //   values.push(numBlogId);
//     // }
//     // if (blog_id && isNaN(Number(blog_id))) {
//     //   return res.status(400).json({ error: 'blog_id 必须为数字' });
//     // }
//     if (parent_id !== undefined) {
//       sql += ' AND parent_id = ?';
//       values.push(parent_id);
//     }

//     if (include_deleted !== 'true') {
//       sql += ' AND id_delete = 0';
//     }

//     const [rows] = await pool.execute(sql, values);
//     res.json(rows);
//   } catch (error) {
//     console.error('获取评论失败:', error);
//     res.status(500).json({ error: '服务器内部错误234567' });
//   }
// });
// // 保存评论 API
// app.post('/api/comments', async (req, res) => {
//   try {
//     const commentData = req.body;
//     console.log(commentData)
//     // 确保所有需要的字段都有有效值，避免undefined
//     const content = commentData.content ? commentData.content : "aa";
//     const userId = commentData.userId ? commentData.userId : 1;
//    // const userName = commentData.user_name ? commentData.user_name : 'aa';
//     const username = commentData.user_name ? commentData.username : "aa";
//    // const blogId = commentData.blogId ? commentData.blogId : 1;
//     const parentId = commentData.parentId ? commentData.parentId : 1;
//     const rootParentId = commentData.root_parent_id ? commentData.root_parent_id : 1;
//     const attachments = commentData.attachments ? commentData.attachments : 10;
//     const isDeleted = commentData.id_delete ? (commentData.id_delete ? 1 : 0) : 0;

//     // 验证必要字段
//     if (!content || !userId ) {
//       console.log(1221)
//       return res.status(400).json({ error: '缺少必要字段: content, user_id' });
//     }

//     const createTime1 = new Date().toISOString().slice(0, 19).replace('T', ' ');
//     const [result] = await pool.execute(
//       `INSERT INTO comments (
//         content, user_id, user_name, 
//         parent_id, root_parent_id, 
//         attachment_count, id_delete, create_time
//       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         content,
//         userId,
//         //userName,
//         username,
//         //blogId,
//         parentId,
//         rootParentId,
//         attachments,
//         isDeleted,
//         createTime1
//       ]
//     );
//     console.log(result)
//     res.status(201).json({ id: result.insertId });
//   } catch (error) {
//     console.error('保存评论失败:', error);

//     // 返回更详细的错误信息，帮助调试
//     res.status(500).json({
//       error: '服务器内部错误',
//       details: {
//         message: error.message,
//         code: error.code,
//         sql: error.sql
//       }
//     });
//   }
// });

// app.post('/api/upload', async (req, res) => {
//   try {
//     // 这里使用中间件处理文件上传，如 multer
//     // 示例逻辑，假设文件上传后返回文件路径数组
//     const files = req.files;
//     const fileUrls = files.map(file => `/uploads/${file.filename}`);
//     res.json({ urls: fileUrls });
//   } catch (error) {
//     console.error('文件上传失败:', error);
//     res.status(500).json({ error: '文件上传失败' });
//   }
// });
// app.post('/api/upload', upload.array('files'), async (req, res) => {
//   try {
//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ error: '未上传文件' });
//     }
//     const fileUrls = req.files.map(file => `/uploads/${file.filename}`);
//     res.json({ urls: fileUrls });
//   } catch (error) {
//     console.error('文件上传失败:', error);
//     res.status(500).json({ error: '文件上传失败' });
//   }
// });
// app.listen(3001, () => {
//   console.log('服务器运行在端口 3001');
// });
// testDbConnection();