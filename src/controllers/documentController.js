const { documents } = require('../models');
const base = require('./baseController');
const db = require('../models/index');
const options = require('./queryoptions');

exports.getAll = (req, res, next) => {
    //base.getAll(documents, req, res, next);    
    getQuery(req, res, next);
}

const getQuery = (req, res, next) => {
    const query = {};
    Object.keys(req.query).forEach(key => {
        if (req.query[key] !== "" && req.query[key] != 'null' && req.query[key] != null ) {
            query[key] = req.query[key]
        }
    })

    let sql = `
    select 
    CONCAT(d.document_type, ' ', d.document_number) concat_type_number,
	d.document_id, d.document_type, d.document_number, d.document_date, d.document_summary, d.document_state_id, d.document_city_id,
	ds.document_scope_id, ds.document_scope_description,
	d.document_status_id, ds2.status_description, d.document_privacy_type, d.document_privacy_unit_id
    from documents d
    inner join document_scopes ds on d.document_scope_id = ds.document_scope_id 
    inner join document_status ds2 on d.document_status_id = ds2.status_id
    `;
    // WHERE d.document_privacy_type = 0 OR d.document_privacy_unit_id = 1;

    for (let i = 0; i < Object.keys(query).length; i ++) {
        const key = Object.keys(query)[i];
        if (i == 0) sql += ` WHERE `;
        if (key.includes('id'))
            sql += `${key} = '${query[key]}'`;
        else
            sql += `${key} LIKE '%${query[key]}%'`;
        if (i < Object.keys(query).length - 1) sql += ` AND `;           
    }


    console.log(sql);
   
    base.rawquery(sql, req, res, next);
}


exports.get = (req, res, next) => {
    base.get(documents, req, res, next, 'document_id');
};

exports.post = (req, res, next) => {
    req.body.document_date = convertData(req.body.document_date);
    base.insert(documents, req, res, next);
}

exports.put = (req, res, next) => {
    req.body.document_date = convertData(req.body.document_date);
    base.update(documents, req, res, next, 'document_id');
}

exports.delete = (req, res, next) => {
    base.delete(documents, req, res, next, 'document_id');
}



function convertData (strData) {

    addHours = (strData) => {
       return strData + " 00:00:00"
    }

    if (strData.includes('-'))
        return addHours(strData);
    let dia = strData.substring(0, 2);
    let mes = strData.substring(2, 4);
    let ano = strData.substring(4, 8);
    const newData = `${ano}-${mes}-${dia}`
    return addHours(newData);
}
