const pmysql = require('promise-mysql');

pmysql.createPool({
    connectionLimit: 3,
    host: "localhost",
    user: "root",
    password: "root",
    database: "proj2022"
})
    .then(p => {
        pool = p;
    })
    .catch(e => {
        console.log("pool error: " + e)
    })

module.exports = {
    getEmployees: async function () {
        return new Promise((resolve, reject) => {
            pool.query('SELECT * FROM employee')
                .then((data) => {
                    resolve(data)
                })
                .catch(error => {
                    reject(error)
                })
        })
    },
    editEmployee: function (eid, data) {
        return new Promise((resolve, reject) => {
            pool.query(`UPDATE employee SET
            ename = '${data.ename}',
            role = '${data.role}',
            salary = ${data.salary}
            WHERE eid LIKE(\"${eid}\")`)
                .then((data) => {
                    resolve(data)
                })
                .catch(error => {
                    reject(error)
                })
        })

    },
    getDepartments: function () {
        return new Promise((resolve, reject) => {
            pool.query('SELECT * FROM dept')
                .then((data) => {
                    resolve(data)
                })
                .catch(error => {
                    reject(error)
                })
        })
    },
    deleteDepartment: function (did) {
        return new Promise((resolve, reject) => {
            pool.query(`DELETE FROM dept WHERE did like(\"${did}\")`)
                .then((data) => {
                    resolve(data)
                })
                .catch(error => {
                    reject(error)
                })
        })

    }
}

