///การเรียกใช้งาน express และ body-parser
const express = require('express')
const app = express()
const mysql = require('mysql2')
const bodyParser = require('body-parser')
const session = require('express-session')
let userObj = { user: [], error: false }
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({
    secret: 'secrer',
    resave: false,
    saveUninitialized: true
}))

app.set('view engine', 'ejs')

///-----------register-----------------
app.get('/register', (req, res) => {
    res.render('register')
})

//------header--------------------
app.get('/header', (req, res) => {
    res.render('header')
})

//----footer---------------------
app.get('/footer', (req, res) => {
    res.render('footer')
})

//การเชื่อมต่อฐานข้อมูล-----------------
const connect = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'regisdb'
})

//การเพิ่มข้อมูลลงในฐานข้อมูล-------------------------
app.post('/addData', (req, res) => {
    connect.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            return res.status(500).send('เชื่อมต่อฐานข้อมูลไม่ได้')
        }

        const params = req.body
        connection.query('INSERT INTO student SET ?', params, (err, result) => {
            connection.release()
            if (err) {
                console.log('ข้อผิดพลาดในการเพิ่มข้อมูล:', err.message)
                return res.status(500).send('ไม่สามารถเพิ่มข้อมูลได้')
            }
            console.log('เพิ่มข้อมูลสำเร็จเรียบร้อย')
            res.send('เพิ่มข้อมูลสำเร็จ')
        })
    })
})

//การแสดงข้อมูลจากฐานข้อมูล-----------------------------
app.get('/showData', (req, res) => {
    connect.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            return res.status(500).send('เชื่อมต่อฐานข้อมูลไม่ได้')
        }

        connection.query('SELECT * FROM student', (err, rows) => {
            connection.release()
            if (!err) {
                const userObj = { user: rows, error: false }
                return res.render('showdata', userObj)
            }

            console.log('ข้อผิดพลาดในการดึงข้อมูล', err)
            return res.status(500).send('ไม่สามารถดึงข้อมูลได้')
        })
    })
})

//การลบข้อมูลในฐานข้อมูล
app.get('/deleteData/:stCode', (req, res) => {
    connect.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            return res.status(500).send('เชื่อมต่อฐานข้อมูลไม่ได้')
        }

        connection.query('DELETE FROM student WHERE stCode = ?', [req.params.stCode], (err, result) => {
            connection.release()
            if (err) {
                console.log('ข้อผิดพลาดในการลบข้อมูล', err)
                return res.status(500).send('ไม่สามารถลบข้อมูลได้')
            }
            res.send('ลบข้อมูลสำเร็จ')
        })
    })
})

//-----ฟอร์มแก้ไขข้อมูล-------------------
app.get('/frmEdit/:stCode', (req, res) => {
    connect.query('SELECT * FROM student WHERE stCode = ?', [req.params.stCode], (err, rows) => {
        if (err) {
            console.log('ข้อผิดพลาดในการค้นหาข้อมูล', err)
            return res.status(500).send('ไม่สามารถค้นหาข้อมูลได้')
        }

        const student = rows[0]
        res.render('editData', { student })
    })
})

//การแก้ไขข้อมูลในฐานข้อมูล
app.post('/updatedata', (req, res) => {
    connect.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            return res.status(500).send('เชื่อมต่อฐานข้อมูลไม่ได้')
        }

        const { stCode, stName, stAddress, stPhone, stEmail } = req.body
        connection.query(
            'UPDATE student SET stName = ?, stAddress = ?, stPhone = ?, stEmail = ? WHERE stCode = ?',
            [stName, stAddress, stPhone, stEmail, stCode],
            (err, result) => {
                connection.release()
                if (err) {
                    console.log('ข้อผิดพลาดในการอัปเดตข้อมูล', err)
                    return res.status(500).send('ข้อมูลไม่สามารถอัปเดตได้')
                }
                res.send('อัปเดตข้อมูลสำเร็จ')
            }
        )
    })
})

///////------ล็อกอิน-------------------
app.get('/auth_login', (req, res) => {
    res.render('login')
})

app.post('/auth_login', (req, res) => {
    var stCode = req.body.stCode
    var Password = req.body.Password
    if(stCode && Password){
        connect.query('SELECT * FROM student WHERE stCode = ? AND Password = ?', [stCode,Password], (err, results) => {
            if(results.length > 0){
                req.session.login = true;
                req.session.stCode = stCode;
                res.redirect('/showData')
            }else{
                res.send('Student ID OR Password Incorrect')
            }
            res.end();
        })
    }else{
        res.send('Please wnter Student ID AND Password ');
        res.end();
    }
})



//----การดึงข้อมูลมาแสดงตามรหัสนักศึกษา
app.post('/getdataByID', (req, res) => {
  connect.getConnection((err, connection) => {
    if (err) throw err;
    console.log("Connection ID:? ", connection.threadId);
    const params = req.body;
    //ใช้คำสั่ง SQL ดึงข้อมูลจากตาราง
    connection.query("SELECT * FROM student WHERE stCode=?", params.stCode, (err, rows) => {
      connection.release(); //คืนค่า connection
      if (!err) {
        userObj = { user: rows, error: err };
        res.render("showdata", { user: rows });
      } else {
        console.log(err);
        res.send("ไม่สามารถแสดงข้อมูลได้");
      }
    })
  })
})


//---การดึงข้อมูลมาแสดงตาม ID
app.get("/searchdata/:stName", (req, res) => {
  connect.getConnection((err, connection) => {
    if (err) throw err;
    connection.query("SELECT * FROM student WHERE stName LIKE ?", `%${req.params.stName}%`, (err, rows) => {
      connection.release();
      if (!err) {
        console.log(rows);
        res.send(rows);
      } else {
        console.log(err);
      }
    })
  })
})

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/auth_login');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000')
})