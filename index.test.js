const axios2 = require("axios");
const WebSocket = require('ws');
const BACKEND_URL = "http://localhost:8000";
const WS_URL = "ws://localhost:8080";

const axios = {
    post: async (...args) => {
        try {
            const res = await axios2.post(...args)
            return res
        }
        catch (error) {
            return error.response
        }
    },
    patch: async (...args) => {
        try {
            const res = await axios2.patch(...args)
            return res
        }
        catch (error) {
            return error.response
        }
    },

    get: async (...args) => {
        try {
            const res = await axios2.get(...args)
            return res
        }
        catch (error) {
            return error.response
        }
    },

    delete: async (...args) => {
        try{
            const res = await axios2.delete(...args)
            return res
        }
        catch (error) {
            return error.response
        }
    }

}

describe("Authentication", () => {
    test('User is able to signup only once', async () => {
        const username = "tanmay" + Math.random();
        const password = "iluvanushka";

        const response = await axios.post(`${BACKEND_URL}/auth/signup`, {
            username,
            password,
            role: "admin"
        })
        expect(response.status).toBe(200)
        expect(response.data.message).toBe("Signup successful")

        const updatedResponse = await axios.post(`${BACKEND_URL}/auth/signup`, {
            username,
            password,
            role: "admin"
        })
        expect(updatedResponse.status).toBe(400)
    });

    test('Signin succeeds if the username and password are correct', async() => {
        const username = "tanmay" + Math.random();
        const password = "iluvanushka";

        await axios.post(`${BACKEND_URL}/auth/signup`, {
            username,
            password,
            type: "admin"
        });

        const response = await axios.post(`${BACKEND_URL}/auth/signin`, {
            username, 
            password
        })
        expect(response.status).toBe(200);
        expect(response.data.data).toBeDefined()
    })

    test('Signin fails if the username and password are incorrect', async() => {
        const username = "tanmay" + Math.random();
        const password = "iluvanushka";

        await axios.post(`${BACKEND_URL}/auth/signup`, {
            username,
            password,
            type: "admin"
        });

        const response = await axios.post(`${BACKEND_URL}/auth/signin`, {
            username: "tanmay",
            password
        })
        expect(response.status).toBe(403)
    })
})


describe("User information endpoints", () => {
    let adminToken;
    let userUserToken
    let avatarId;
    let adminUserId;
    let userUserId;

    beforeAll(async () => {
        const username = "tanmay" + Math.random();
        const password = "123456"

        const tusername = "tanmay" + Math.random();

        const userResponse = await axios.post(`${BACKEND_URL}/auth/signup`, {
            username,
            password,
            role: "admin"
        });

        adminUserId = userResponse.data.data

        const response = await axios.post(`${BACKEND_URL}/auth/signin`, {
            username,
            password
        });


        adminToken = response.data.data;
        const avatarResponse = await axios.post(`${BACKEND_URL}/admin/avatar`, {
            "name": "Tanmay Bro" + Math.random(),
            "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s"
        }, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        avatarId = avatarResponse.data.data;
    
        const anotherUserResponse = await axios.post(`${BACKEND_URL}/auth/signup`, {
            username: tusername,
            password
        });

        userUserId = anotherUserResponse.data.data

        const anotherResponse = await axios.post(`${BACKEND_URL}/auth/signin`, {
            username: tusername,
            password
        });

        userUserToken = anotherResponse.data.data
    });

    test('User cant update their metadata with a wrong avatar id', async() => {
        const response = await axios.patch(`${BACKEND_URL}/user/metadata?avatar_id=${2345678}`,{}, {
            headers: {
                'Authorization': `Bearer ${userUserToken}`
            }
        });
        expect(response.status).toBe(403)
    });

    test('User can update their metadata with an avatar id', async() => {
        const response = await axios.patch(`${BACKEND_URL}/user/metadata?avatar_id=${avatarId}`,{} ,{
            headers: {
                'Authorization': `Bearer ${userUserToken}`
            }
        });

        expect(response.status).toBe(200)
    });

    test('User cannot update due to no login token', async () => {
        const response = await axios.patch(`${BACKEND_URL}/user/metadata?avatar_id=${avatarId}`);
        expect(response.status).toBe(403)
    });

    test('User can get all avatars', async () => {
        const response = await axios.get(`${BACKEND_URL}/user/avatars`);
        expect(response.status).toBe(200);
        expect(response.data.data).toBeDefined()
        expect(response.data.data.length).not.toBe(0)
    });

    test('User can get other avatars', async () => {
        const response = await axios.get(`${BACKEND_URL}/user/metadata/bulk?ids=[${userUserId}]`, {
            headers: {
                'Authorization': `Bearer ${userUserToken}`
            }
        });
        expect(response.status).toBe(200);
        expect(response.data.data).toBeDefined();
        expect(response.data.data.length).not.toBe(0);
        expect(response.data.data.find(x => x.id === userUserId))
    });
})

describe('Space information', () => {
    let mapId;
    let elementId1;
    let elementId2;
    let spaceId;
    let userId;
    let userToken;
    let adminId;
    let adminToken;

    beforeAll(async () => {
        const adminUsername = "admin"+Math.random();
        const password = "iluvanushka";
        const userUsername = "tanmay"+Math.random();

        const adminResponse = await axios.post(`${BACKEND_URL}/auth/signup`, {
            username: adminUsername,
            password,
            role: "admin"
        });

        expect(adminResponse.status).toBe(200);

        const adminResponse2 = await axios.post(`${BACKEND_URL}/auth/signin`, {
            username: adminUsername,
            password,
        });

        expect(adminResponse2.status).toBe(200);
        adminToken = adminResponse2.data.data;

        const userResponse = await axios.post(`${BACKEND_URL}/auth/signup`, {
            username: userUsername,
            password
        });
        
        expect(userResponse.status).toBe(200);

        const userResponse2 = await axios.post(`${BACKEND_URL}/auth/signin`, {
            username: userUsername,
            password
        });

        expect(userResponse2.status).toBe(200);
        userToken = userResponse2.data.data;

        const element1Response = await axios.post(`${BACKEND_URL}/admin/element`, {
            "image_url": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true,
            "name": "Element"+Math.random() 
        }, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });

        expect(element1Response.status).toBe(200);
        elementId1 = element1Response.data.data;
                
        const element2Response = await axios.post(`${BACKEND_URL}/admin/element`, {
            "image_url": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true,
            "name": "Element"+Math.random() 
        }, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        expect(element2Response.status).toBe(200);
        elementId2 = element2Response.data.data;

        const elementUpdateResponse = await axios.patch(`${BACKEND_URL}/admin/element/${elementId2}`, {
            "image_url": "http:thunbaikm.com/a.png"
        },{
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        })
        expect(elementUpdateResponse.status).toBe(200);

        const mapResponse = await axios.post(`${BACKEND_URL}/admin/map`, {
            "thumbnail": "https://thumbnail.com/a.png",
            "width": 100,
            "height": 50,
            "name": "100 person interview room"+ Math.random(),
            "defaultElements": [{
                    id: elementId1,
                    x: 20,
                    y: 20
                }, {
                  id: elementId2,
                    x: 18,
                    y: 20
                }
            ]
         }, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });   
        expect(mapResponse.status).toBe(200);
        mapId = mapResponse.data.data;
    })

    test('User is able to create a space', async () => {
        const response = await axios.post(`${BACKEND_URL}/space`, {
            "name": "Test",
            "width": 100,
            "height": 50,
            "mapId": mapId
        }, {
            headers: {
                'Authorization': `Bearer ${userToken}`
            }
        })

        expect(response.status).toBe(200);
        spaceId = response.data.spaceId;
    })

    test('User is able to create a space with just map id', async () => {
        const response = await axios.post(`${BACKEND_URL}/space`, {
            "name": "Test",
            "mapId": mapId
        }, {
            headers: {
                'Authorization': `Bearer ${userToken}`
            }
        })

        expect(response.status).toBe(200);
        spaceId = response.data.spaceId;
    })

    test('User is able to create a space without map id', async () => {
        const response = await axios.post(`${BACKEND_URL}/space`, {
            "name": "Test",
            "width": 100,
            "height": 50
        }, {
            headers: {
                'Authorization': `Bearer ${userToken}`
            }
        })

        expect(response.status).toBe(200);
        spaceId = response.data.spaceId;
    });

    test('User is not able to create a space without anything', async () => {
        const response = await axios.post(`${BACKEND_URL}/space`, {
            "name": "Test"
        }, {
            headers: {
                'Authorization': `Bearer ${userToken}`
            }
        })

        expect(response.status).toBe(400);
    });


    test('User is not able to create a space that does not exist', async () => {
        const response = await axios.delete(`${BACKEND_URL}/space/10101010`, {
            headers: {
                'Authorization': `Bearer ${userToken}`
            }
        })
        expect(response.status).toBe(400);
    })

    test('User is able to delete a space that exist', async () => {
        const response = await axios.delete(`${BACKEND_URL}/space/${spaceId}`, {
            headers: {
                'Authorization': `Bearer ${userToken}`
            }
        })
        expect(response.status).toBe(200);
    });

    test('User is not able to delete the space of other', async () => {
        const response = await axios.delete(`${BACKEND_URL}/space/${spaceId}`, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        })
        expect(response.status).toBe(400);
    });

    test('Admin has only one space initially', async () => {
        const response = await axios.get(`${BACKEND_URL}/space/all`, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        })
        expect(response.status).toBe(200);
        expect(response.data.spaces.length).toBe(1);
    })

    test('Admin has two space afterwards', async () => {
        const response = await axios.post(`${BACKEND_URL}/space`, {
            "name": "1717"+Math.random(),
            "height": 500,
            "width": 200
        }, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        expect(response.status).toBe(200);
        spaceId = response.data.spaceId
        
        const getResponse = await axios.get(`${BACKEND_URL}/space/all`, {
            headers: {
                'authorization': `Bearer ${adminToken}`
            }
        });

        expect(getResponse.status).toBe(200);
        const filteredSpace = getResponse.data.spaces.find(x => x.id === spaceId)
        expect(getResponse.data.spaces.length).toBe(2);
        expect(filteredSpace).toBeDefined();
    })
});

describe('Arena Endpoints', () => {
    let mapId;
    let element1Id;
    let element2Id;
    let adminToken;
    let adminId;
    let userToken;
    let userId;
    let spaceId;

    beforeAll(async () => {
        const adminUsername = "admin"+Math.random();
        const password = "iluvanushka";
        const userUsername = "tanmay"+Math.random();

        const adminResponse = await axios.post(`${BACKEND_URL}/auth/signup`, {
            username: adminUsername,
            password,
            role: "admin"
        });

        expect(adminResponse.status).toBe(200);

        const adminResponse2 = await axios.post(`${BACKEND_URL}/auth/signin`, {
            username: adminUsername,
            password,
        });

        expect(adminResponse2.status).toBe(200);
        adminToken = adminResponse2.data.data;

        const userResponse = await axios.post(`${BACKEND_URL}/auth/signup`, {
            username: userUsername,
            password
        });
        
        expect(userResponse.status).toBe(200);

        const userResponse2 = await axios.post(`${BACKEND_URL}/auth/signin`, {
            username: userUsername,
            password
        });

        expect(userResponse2.status).toBe(200);
        userToken = userResponse2.data.data;

        const element1Response = await axios.post(`${BACKEND_URL}/admin/element`, {
            "image_url": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true,
            "name": "Element"+Math.random() 
        }, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });

        expect(element1Response.status).toBe(200);
        element1Id = element1Response.data.data;
                
        const element2Response = await axios.post(`${BACKEND_URL}/admin/element`, {
            "image_url": "h:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true,
            "name": "Element"+Math.random() 
        }, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        expect(element2Response.status).toBe(200);
        element2Id = element2Response.data.data;

        const elementUpdateResponse = await axios.patch(`${BACKEND_URL}/admin/element/${element2Id}`, {
            "image_url": "http:thunbaikm.com/a.png"
        },{
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        })
        expect(elementUpdateResponse.status).toBe(200);

        const mapResponse = await axios.post(`${BACKEND_URL}/admin/map`, {
            "thumbnail": "https://thumbnail.com/a.png",
            "width": 100,
            "height": 50,
            "name": "100 person interview room"+ Math.random(),
            "defaultElements": [{
                    id: element1Id,
                    x: 1,
                    y: 1
                }, {
                    id: element2Id,
                    x: 2,
                    y: 2
                }
            ]
            }, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });   
        expect(mapResponse.status).toBe(200);
        mapId = mapResponse.data.data;

        const spaceResponse = await axios.post(`${BACKEND_URL}/space`, {
            "name": "Tanmay"+Math.random(),
            "height": 50,
            "width": 50,
            "mapId": mapId
        }, {
            headers: {
                'authorization': `Bearer ${userToken}`
            }
        });
        expect(spaceResponse.status).toBe(200);
        spaceId = spaceResponse.data.spaceId;
    })

    test('Incorrect spaceId returns 400 response', async () => {
        const response = await axios.get(`${BACKEND_URL}/space/12345667`, {
            headers: {
                'authorization': `Bearer ${userToken}`
            }
        });
        expect(response.status).toBe(400);
    });

    test('Correct spaceId returns all elements', async () => {
        const response = await axios.get(`${BACKEND_URL}/space/${spaceId}`, {
            headers: {
                'authorization': `Bearer ${userToken}`
            }
        });
        expect(response.status).toBe(200);
        expect(response.data.elements.length).toBe(2);
    });
    
    test('Delete endpoint is able to delete an endpoint', async () => {
        const response = await axios.get(`${BACKEND_URL}/space/${spaceId}`, {
            headers: {
                'authorization': `Bearer ${userToken}`
            }
        });
        const id = response.data.elements[0].id;
        
        let res = await axios.delete(`${BACKEND_URL}/space/element/${id}`, {
            headers: {
                'authorization': `Bearer ${userToken}`
            }
        });
        expect(res.status).toBe(200);


        const newResponse = await axios.get(`${BACKEND_URL}/space/${spaceId}`, {
            headers: {
                'authorization': `Bearer ${userToken}`
            }
        });
        expect(newResponse.data.elements.length).toBe(1);
    });

    test('Adding an element fails if dimensions are from outside the space', async () => {
        const res = await axios.post(`${BACKEND_URL}/space/element`, {
            "element_id": element2Id,
            "space_id": spaceId,
            "x": 1000,
            "y": 1000
        }, {
            headers: {
                'authorization': `Bearer ${userToken}`
            }
        });
        expect(res.status).toBe(400)
    });

    

    test('Adding an element in the space limit should pass', async () => {


        const res = await axios.post(`${BACKEND_URL}/space/element`, {
            "element_id": element1Id,
            "space_id": spaceId,
            "x": 3,
            "y": 3
        }, {
            headers: {
                'authorization': `Bearer ${userToken}`
            }
        });
        expect(res.status).toBe(200);

        const response = await axios.get(`${BACKEND_URL}/space/${spaceId}`, {
            headers: {
                'authorization': `Bearer ${userToken}`
            }
        });
        expect(response.status).toBe(200);
        expect(response.data.elements.length).toBe(2);
        // because one got deleted above
    })
});


describe("Admin Endpoints", () => {
    let adminToken;
    let userToken;

    beforeAll(async () => {
        const username = `kirat-${Math.random()}`
        const password = "123456"
 
        await axios.post(`${BACKEND_URL}/auth/signup`, {
         username,
         password,
         role: "admin"
        });
 
        const response = await axios.post(`${BACKEND_URL}/auth/signin`, {
         username: username,
         password
        })
 
        adminToken = response.data.data

        await axios.post(`${BACKEND_URL}/auth/signup`, {
            username: username + "-user",
            password,
            role: "user"
        });
   
    
        const userSigninResponse = await axios.post(`${BACKEND_URL}/auth/signin`, {
            username: username  + "-user",
            password
        })
    
        userToken = userSigninResponse.data.data
    });


    test("User is not able to hit admin Endpoints", async () => {
        const elementReponse = await axios.post(`${BACKEND_URL}/admin/element`, {
            "image_url": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
          "static": true,
          "name": "hjds"+Math.random()
        }, {
            headers: {
                authorization: `Bearer ${userToken}`
            }
        });

        const mapResponse = await axios.post(`${BACKEND_URL}/admin/map`, {
            "thumbnail": "https://thumbnail.com/a.png",
            "height": 400,
            "width": 100,
            "name": "test space",
            "defaultElements": []
         }, {
            headers: {
                authorization: `Bearer ${userToken}`
            }
        })

        const avatarResponse = await axios.post(`${BACKEND_URL}/admin/avatar`, {
            "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            "name": "Timmy"
        }, {
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        })

        const updateElementResponse = await axios.patch(`${BACKEND_URL}/admin/element/123`, {
            "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
        }, {
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        })

        expect(elementReponse.status).toBe(403)
        expect(mapResponse.status).toBe(403)
        expect(avatarResponse.status).toBe(403)
        expect(updateElementResponse.status).toBe(403)
    })

    test("Admin is able to hit admin Endpoints", async () => {
        const elementReponse = await axios.post(`${BACKEND_URL}/admin/element`, {
            "image_url": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
          "static": true,
          "name": "hjds"+Math.random()
        }, {
            headers: {
                authorization: `Bearer ${adminToken}`
            }
        });

        const mapResponse = await axios.post(`${BACKEND_URL}/admin/map`, {
            "thumbnail": "https://thumbnail.com/a.png",
            "height": 400,
            "width": 100,
            "name": "test space"+Math.random(),
            "defaultElements": []
         }, {
            headers: {
                authorization: `Bearer ${adminToken}`
            }
        })

        const avatarResponse = await axios.post(`${BACKEND_URL}/admin/avatar`, {
            "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            "name": "Timmy"+Math.random()
        }, {
            headers: {
                "authorization": `Bearer ${adminToken}`
            }
        })

        const updateElementResponse = await axios.patch(`${BACKEND_URL}/admin/element/123`, {
            "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
        }, {
            headers: {
                "authorization": `Bearer ${adminToken}`
            }
        })


        expect(elementReponse.status).toBe(200)
        expect(mapResponse.status).toBe(200)
        expect(avatarResponse.status).toBe(200)
        expect(updateElementResponse.status).toBe(200)
    })
});



describe('WS Tests', () => {
    let adminToken;
    let userToken;
    let adminUserId;
    let userId;
    let mapId;
    let spaceId;
    let element1;
    let element2;
    let ws1;
    let ws2;
    let wsResponse = [];
    let wsResponse2 = [];
    let userX;
    let userY;
    let adminX;
    let adminY;

    function waitForAndPopMessages(messageArray) {
        return new Promise(resolve => {
            if(messageArray.length > 0) {
                const value = messageArray.shift()
                resolve(value);
            }
            else {
                let interval = setInterval(() => {
                    if(messageArray.length > 0) {
                        resolve(messageArray.shift());
                        clearInterval(interval)
                    }
                }, 100)
            }
        })
    }

    async function setupWs() {
        ws1 = new WebSocket(WS_URL);
        ws1.onmessage = (event) => {
            wsResponse.push(JSON.parse(event.data));
        };
        await new Promise(r => {
            ws1.onopen = r
        });
    
        ws2 = new WebSocket(WS_URL);
        ws2.onmessage = (event) => {
            wsResponse2.push(JSON.parse(event.data));
        }
        await new Promise(r => {
            ws2.onopen = r
        }) 
    }

    async function setupHTTP() {
        const adminUsername = "admin"+Math.random();
        const password = "hjk";
        const userUsername = "tanmay"+Math.random();

        const adminResponse = await axios.post(`${BACKEND_URL}/auth/signup`, {
            username: adminUsername,
            password,
            role: "admin"
        });

        expect(adminResponse.status).toBe(200);
        adminUserId = adminResponse.data.data

        const adminResponse2 = await axios.post(`${BACKEND_URL}/auth/signin`, {
            username: adminUsername,
            password,
        });

        expect(adminResponse2.status).toBe(200);
        adminToken = adminResponse2.data.data;

        const userResponse = await axios.post(`${BACKEND_URL}/auth/signup`, {
            username: userUsername,
            password
        });
        
        expect(userResponse.status).toBe(200);
        userId = userResponse.data.data

        const userResponse2 = await axios.post(`${BACKEND_URL}/auth/signin`, {
            username: userUsername,
            password
        });

        expect(userResponse2.status).toBe(200);
        userToken = userResponse2.data.data;

        const element1Response = await axios.post(`${BACKEND_URL}/admin/element`, {
            "image_url": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true,
            "name": "Element"+Math.random() 
        }, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });

        expect(element1Response.status).toBe(200);
        element1 = element1Response.data.data;
                
        const element2Response = await axios.post(`${BACKEND_URL}/admin/element`, {
            "image_url": "h:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true,
            "name": "Element"+Math.random() 
        }, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        expect(element2Response.status).toBe(200);
        element2 = element2Response.data.data;

        const elementUpdateResponse = await axios.patch(`${BACKEND_URL}/admin/element/${element2}`, {
            "image_url": "http:thunbaikm.com/a.png"
        },{
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        })
        expect(elementUpdateResponse.status).toBe(200);

        const mapResponse = await axios.post(`${BACKEND_URL}/admin/map`, {
            "thumbnail": "https://thumbnail.com/a.png",
            "width": 100,
            "height": 50,
            "name": "100 person interview room"+ Math.random(),
            "defaultElements": [{
                    id: element1,
                    x: 1,
                    y: 1
                }, {
                    id: element2,
                    x: 2,
                    y: 2
                }
            ]
            }, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });   
        expect(mapResponse.status).toBe(200);
        mapId = mapResponse.data.data;

        const spaceResponse = await axios.post(`${BACKEND_URL}/space`, {
            "name": "Tanmay"+Math.random(),
            "height": 50,
            "width": 50,
            "mapId": mapId
        }, {
            headers: {
                'authorization': `Bearer ${userToken}`
            }
        });
        expect(spaceResponse.status).toBe(200);
        spaceId = spaceResponse.data.spaceId;
    }

    beforeAll(async () => {
        await setupHTTP()
        await setupWs()
    });

    test('Get back acknowledgement after joining the space', async () => {
        ws1.send(JSON.stringify({
            "type": "join",
            "payload": {
                "spaceId": spaceId,
                "token": adminToken
            }
        }));

        ws2.send(JSON.stringify({
            "type": "join",
            "payload": {
                "spaceId": spaceId,
                "token": userToken
            }
        }));

        const message1 = await waitForAndPopMessages(wsResponse);
        const message2 = await waitForAndPopMessages(wsResponse);
        const message3 = await waitForAndPopMessages(wsResponse2);
        const message4 = await waitForAndPopMessages(wsResponse2);
        const message5 = await waitForAndPopMessages(wsResponse);

        expect(message1.type).toBe('user-join')
        expect(message2.type).toBe("space-joined");
        expect(message3.type).toBe("user-join");
        expect(message4.type).toBe("space-joined");
        expect(message5.type).toBe("user-join");

        expect(Object.keys(message2.payload.users).length).toBe(1)
        expect(Object.keys(message4.payload.users).length).toBe(2)
        expect(message1.payload.x).toBe(message2.payload.spawn.x);
        expect(message1.payload.y).toBe(message2.payload.spawn.y);
        expect(message3.payload.userId).toBe(userId)

        adminX = message2.payload.spawn.x
        adminY = message2.payload.spawn.y
        userX = message4.payload.spawn.x
        userY = message4.payload.spawn.y
    }, 10000)

    test('User should not be able to move across the boundary of the wall', async () => {
        ws1.send(JSON.stringify({
            type: "move",
            payload: {
                x: 10000,
                y: 1010
            }
        }));

        const message = await waitForAndPopMessages(wsResponse);
        expect(message.type).toBe("movement-rejected");
        expect(message.payload.x).toBe(adminX);
        expect(message.payload.y).toBe(adminY);
    })

    test('User should not be able to move two blocks at the same time', async () => {
        ws1.send(JSON.stringify({
            type: "move",
            payload: {
                x: adminX + 2,
                y: adminY
            }
        }));
        const message = await waitForAndPopMessages(wsResponse);
        expect(message.type).toBe("movement-rejected");
        expect(message.payload.x).toBe(adminX);
        expect(message.payload.y).toBe(adminY);
    })


    test('User should be able to move one block at a time', async () => {
        ws1.send(JSON.stringify({
            type: "move",
            payload: {
                x: adminX+1,
                y: adminY
            }
        }));
        const message = await waitForAndPopMessages(wsResponse2)
        expect(message.type).toBe("movement")
        expect(message.payload.x).toBe(adminX+1)
        expect(message.payload.y).toBe(adminY)
    });

    test('User getting a message if someone leaves in that room', async () => {
        ws1.close();
        const message = await waitForAndPopMessages(wsResponse2);
        console.log(message);
        expect(message.type).toBe("user-left");
        console.log(adminUserId,"fff");
        expect(message.payload.userId).toBe(adminUserId);
    })

}, 10000)

