"use strict";

const docs_config = {
    openapi: "3.0.3",
    basePath: '/',
    schemes: ['http', 'https'],
    info: {
        title: 'HLLBAN DOCS',
        version: '1.0.0',
        description: 'HLLBAN 后端接口文档，任何问题请到github的HLLBAN仓库提出问题',
        license: {
            name: 'Apache 2.0',
            url: 'http://www.apache.org/licenses/LICENSE-2.0.html'
        }
    },
    servers: [
        {"url": "http://127.0.0.1:3000/api"},
    ],
    tags: [],
    components: {
        "securitySchemes": {
            "x-access-token": {
                'type': "apiKey",
                'name': "x-access-token",
                'in': "header"
            }
        }
    },
}

export default docs_config;