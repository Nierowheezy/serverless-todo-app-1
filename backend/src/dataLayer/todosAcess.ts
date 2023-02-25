import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
// import * as AWSXRay from 'aws-xray-sdk'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { createLogger } from '../utils/logger'
var AWSXRay = require('aws-xray-sdk')

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic


export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly todosIndex = process.env.INDEX_NAME
    ) { }

    async getAllTodos(userId: string): Promise<TodoItem[]> {
        logger.info('Get all todos function called')

        const result = await this.docClient
            .query({
                TableName: this.todosTable,
                IndexName: this.todosIndex,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                    ':userId': userId

                }
            })
            .promise()

        const items = result.Items
        return items as TodoItem[]

    }


    async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
        logger.info('Create todo function called')

        const result = await this.docClient
            .put({
                TableName: this.todosTable,
                Item: todoItem
            })
            .promise()
        logger.info('Todo item created', result)


        return todoItem as TodoItem

    }


    async updateTodo(userId: string, todoId: string, todoUpdate: TodoUpdate): Promise<TodoUpdate> {
        logger.info('Update todo item function called')

        await this.docClient
            .update({
                TableName: this.todosTable,
                Key: {
                    todoId: todoId,
                    userId: userId
                },
                UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
                ExpressionAttributeValues: {
                    ':name': todoUpdate.name,
                    ':dueDate': todoUpdate.dueDate,
                    ':done': todoUpdate.done,
                },
                ExpressionAttributeNames: {
                    '#name': 'name'
                },
            })
            .promise()

        return todoUpdate
    }


    async deleteTodo(userId: string, todoId: string): Promise<void> {
        logger.info('Delete todo item function called')

        await this.docClient
            .delete({
                TableName: this.todosTable,
                Key: {
                    todoId: todoId,
                    userId: userId
                }
            })
            .promise()
    }

    async updateTodoAttachementUrl(userId: string, todoId: string, attachmentUrl: string): Promise<void> {
        logger.info('Update todo attachment url function called')
        await this.docClient
            .update({
                TableName: this.todosTable,
                Key: {
                    todoId: todoId,
                    userId: userId
                },
                UpdateExpression: 'set attachmentUrl = :attachmentUrl',
                ExpressionAttributeValues: {
                    ':attachmentUrl': attachmentUrl,
                },
            })
            .promise()
    }


}








