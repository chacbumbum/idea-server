import Express from 'express';
import mongoose from 'mongoose';
import validator from 'validator';
import _ from 'lodash';

import { Product } from './../models';
import { getErrorMessage, generateErrors } from './Error';


/**
 * @api {get} /api/v1/product List product
 * @apiGroup Product
 *
 * @apiSuccess {ObjectId} _id
 * @apiSuccess {Array} data
 * @apiVersion 1.0.0
 */
export function list(req, res) {

    Product.find().populate('repositoryId').then(response => {
        return res.json(response);
    }, error => {
        return res.status(400).send({
            message: getErrorMessage(error)
        });
    });
}

/**
 * @api {post} /api/v1/product Create product
 * @apiGroup Product
 * @apiPermission auth
 * @apiParam {String} code Product Code
 * @apiParam {String} name Product name
 * @apiParam {Number} price Product price
 * @apiParam {Number} total Product quantity
 * @apiParam {String} image Product image
 * @apiParam {ObjectID} repositoryId Repository ID
 *
 * @apiSuccess {ObjectId} _id
 * @apiSuccess {String} code Product Code
 * @apiSuccess {String} name Product name
 * @apiSuccess {Number} price Product price
 * @apiSuccess {Number} total Product quantity
 * @apiSuccess {String} image Product image
 * @apiVersion 1.0.0
 *
 * @apiHeader {String} Authorization Accesstoken for user.
 * @apiHeaderExample {Object} Header-Example:
    {
        "Authorization": "Bearer token-here"
    }
 *
 */
export function create(req, res) {
    let product = new Product(req.body);
    product.userId = req.auth.id;
    product.validate((err) => {
        if (err) {
            const messages = generateErrors(err.errors);
            return res.status(400).send({
                validate: messages
            });
        }

        product.save().then(data => {
            return res.json(data);
        }, err => {
            return res.status(400).send({
                message: getErrorMessage(err)
            });
        });
    });

}

/**
 * @api {delete} /api/v1/product/:code Delete product
 * @apiGroup Product
 * @apiPermission auth
 * @apiParam {String} code Product Code
 *
 * @apiSuccess {ObjectId} _id
 * @apiSuccess {String} code Product Code
 * @apiSuccess {String} name Product name
 * @apiVersion 1.0.0
 */
export function remove(req, res) {
    req.product.remove().then((data) => {
        return res.json(data);
    }, err => {
        return res.status(400).send({
            message: getErrorMessage(err)
        });
    });
}


/**
 * @api {get} /api/v1/product/:code Get product
 * @apiGroup Product
 * @apiParam {String} code Product Code
 *
 * @apiSuccess {ObjectId} _id
 * @apiSuccess {String} code Product Code
 * @apiSuccess {String} name Product name
 * @apiSuccess {Number} price Product price
 * @apiSuccess {Number} total Product quantity
 * @apiSuccess {String} image Product image
 * @apiVersion 1.0.0
 */
export function read(req, res) {
    return res.json(req.product);
}

/**
 * @api {put} /api/v1/product/:code Update product
 * @apiGroup Product
 * @apiPermission auth
 * @apiParam {String} code Product Code
 * @apiParam {String} [name] Product name
 * @apiParam {Number} [price] Product price
 * @apiParam {Number} [total] Product quantity
 * @apiParam {String} [image] Product image
 * @apiParam {ObjectID} repositoryId Repository ID
 *
 * @apiSuccess {ObjectId} _id
 * @apiSuccess {String} code Product Code
 * @apiSuccess {String} name Product name
 * @apiSuccess {Number} price Product price
 * @apiSuccess {Number} total Product quantity
 * @apiSuccess {String} image Product image
 * @apiVersion 1.0.0
 *
 * @apiHeader {String} Authorization Accesstoken for user.
 * @apiHeaderExample {Object} Header-Example:
    {
        "Authorization": "Bearer token-here"
    }
 *
 */
export function update(req, res) {
    delete req.body._id;
    delete req.body.code;
    let product = req.product;
    let updateData = _.omitBy(req.body, _.isEmpty);
    product.set(updateData);
    product.userId = req.auth.id;
    product.validate((err) => {
        if (err) {
            const messages = generateErrors(err.errors);
            return res.status(400).send({
                validate: messages
            });
        }

        product.save().then(data => {
            return res.json(data);
        }, err => {
            return res.status(400).send({
                message: getErrorMessage(err)
            });
        });
    });
}

export function removeList(req, res) {
    const codes = req.query.code.split(',');

    Product.remove({ code: { $in: codes } }).then(response => {
        return res.json(response);
    }, error => {
        return res.status(400).send({
            message: getErrorMessage(err)
        });
    });
}

export function getProductByCode(req, res, next, code) {

    Product.findOne({ code: code })
        .populate('repositoryId').then(data => {
            if (!data) {
                return res.status(400).send({
                    message: 'No Product with that identifier has been found'
                });
            }
            req.product = data;
            return next();
        }, err => {
            return next(err);
        });
}