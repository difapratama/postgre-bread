var express = require('express');
var router = express.Router();

module.exports = function (pool) {

  // pool.query('select * from  result', (err, res) => {
  //   console.log(res);
  // })

  router.get('/', function (req, res, next) {
    let params = [];
    let isFilter = false;

    if (req.query.checkid && req.query.formid) {
      params.push(`id=${req.query.formid}`);
      isFilter = true;
    }
    if (req.query.checkstring && req.query.formstring) {
      params.push(`string like '%${req.query.formstring}%'`);
      isFilter = true;
    }
    if (req.query.checkinteger && req.query.forminteger) {
      params.push(`integer=${req.query.forminteger}`);
      isFilter = true;
    }
    if (req.query.checkfloat && req.query.formfloat) {
      params.push(`float=${req.query.formfloat}`);
      isFilter = true;
    }
    if (req.query.checkdate && req.query.startdate && req.query.enddate) {
      params.push(`date between '${req.query.startdate}' and '${req.query.enddate}'`);
      isFilter = true;
    }
    if (req.query.checkboolean && req.query.boolean) {
      params.push(`boolean='${req.query.boolean}'`);
      isFilter = true;
    }
    let sql = `select count(*) as total from result`;
    if (isFilter) {
      sql += ` where ${params.join(' and ')}`
    }
    pool.query(sql, (err, count) => {
      const page = req.query.page || 1;
      const limit = 5;
      const offset = (page - 1) * limit;
      const url = req.url == '/' ? '/?page=1' : req.url
      const total = count.rows[0].total;
      const pages = Math.ceil(total / limit);
      sql = `select * from result`;
      if (isFilter) {
        sql += ` where ${params.join(' and ')}`
      }
      sql += ` ORDER BY ID ASC limit ${limit} offset ${offset}`;
      console.log(sql);

      pool.query(sql, (err, data) => {
        res.render('index', {
          rows: data.rows,
          page,
          pages,
          query: req.query,
          url
        });
      });
    });
  });

  router.get('/add', function (req, res, next) {
    res.render('add');
  });

  // Menerima data input from user
  router.post('/add', function (req, res) {

    // inserting data
    let sql = `INSERT INTO result(string, integer, float, date, boolean) VALUES ('${req.body.string}', ${parseInt(req.body.integer)}, ${parseFloat(req.body.float)},'${req.body.date}', ${req.body.boolean})`;

    pool.query(sql, function (err) {
      if (err) {
        console.log(err.message);
      }
      console.log(`data berhasil di masukkan`);
      console.log(sql);
      res.redirect('/');
    });
  })

  router.post('/edit/:id', (req, res, next) => {
    let id = req.params.id;
    let string = req.body.string;
    let integer = parseInt(req.body.integer);
    let float = parseFloat(req.body.float);
    let date = req.body.date;
    let boolean = req.body.boolean;
    pool.query(`UPDATE result set string='${string}', integer=${integer}, float=${float}, date='${date}', boolean='${boolean}' where id=${id}`, (err) => {
      if (err) {
        console.error(err);
        return res.send(err)
      }
      console.log('upgrade success');
      res.redirect('/');
    })
  })

  router.get('/edit/:id', function (req, res, next) {
    let id = req.params.id;
    pool.query(`SELECT * FROM result WHERE id=${id}`, (err, data) => {
      res.render('edit', {
        item: data.rows[0],
        id: id
      })
    })
  });

  // delete data
  router.get('/delete/:id', function (req, res, next) {
    let id = req.params.id;
    pool.query(`DELETE FROM result where id = ${id}`, req.body.id, (err) => {
      if (err) {
        console.log(err.message);
      }
      console.log(`data berhasil di delete`);

    });
    res.redirect('/');
  });

  return router;

};
