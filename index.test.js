const axios2 = require("axios");
const BACKEND_URL = "http://localhost:8000";

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

}

// describe("Authentication", () => {
//     test('User is able to signup only once', async () => {
//         const username = "tanmay" + Math.random();
//         const password = "iluvanushka";

//         const response = await axios.post(`${BACKEND_URL}/auth/signup`, {
//             username,
//             password,
//             role: "admin"
//         })
//         expect(response.data.status).toBe(200)
//         expect(response.data.message).toBe("Signup successful")

//         const updatedResponse = await axios.post(`${BACKEND_URL}/auth/signup`, {
//             username,
//             password,
//             role: "admin"
//         })
//         expect(updatedResponse.data.status).toBe(400)
//         expect(updatedResponse.data.message).toBe("User already exist")
//     });

//     test('Signin succeeds if the username and password are correct', async() => {
//         const username = "tanmay" + Math.random();
//         const password = "iluvanushka";

//         await axios.post(`${BACKEND_URL}/auth/signup`, {
//             username,
//             password,
//             type: "admin"
//         });

//         const response = await axios.post(`${BACKEND_URL}/auth/signin`, {
//             username, 
//             password
//         })
//         expect(response.status).toBe(200);
//         expect(response.data.data).toBeDefined()
//     })

//     test('Signin fails if the username and password are incorrect', async() => {
//         const username = "tanmay" + Math.random();
//         const password = "iluvanushka";

//         await axios.post(`${BACKEND_URL}/auth/signup`, {
//             username,
//             password,
//             type: "admin"
//         });

//         const response = await axios.post(`${BACKEND_URL}/auth/signin`, {
//             username: "tanmay",
//             password
//         })
//         expect(response.data.status).toBe(403)
//     })
// })


// describe("User information endpoints", () => {
//     let adminToken;
//     let userUserToken
//     let avatarId;
//     let adminUserId;
//     let userUserId;

//     beforeAll(async () => {
//         const username = "tanmay" + Math.random();
//         const password = "123456"

//         const tusername = "tanmay" + Math.random();

//         const userResponse = await axios.post(`${BACKEND_URL}/auth/signup`, {
//             username,
//             password,
//             role: "admin"
//         });

//         adminUserId = userResponse.data.data

//         const response = await axios.post(`${BACKEND_URL}/auth/signin`, {
//             username,
//             password
//         });


//         adminToken = response.data.data;
//         const avatarResponse = await axios.post(`${BACKEND_URL}/admin/avatar`, {
//             "name": "Tanmay Bro" + Math.random(),
//             "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s"
//         }, {
//             headers: {
//                 'Authorization': `Bearer ${adminToken}`
//             }
//         });
//         avatarId = avatarResponse.data.data;
    
//         const anotherUserResponse = await axios.post(`${BACKEND_URL}/auth/signup`, {
//             username: tusername,
//             password
//         });

//         userUserId = anotherUserResponse.data.data

//         const anotherResponse = await axios.post(`${BACKEND_URL}/auth/signin`, {
//             username: tusername,
//             password
//         });

//         userUserToken = anotherResponse.data.data
//     });

//     test('User cant update their metadata with a wrong avatar id', async() => {
//         const response = await axios.patch(`${BACKEND_URL}/user/metadata?avatar_id=${2345678}`,{}, {
//             headers: {
//                 'Authorization': `Bearer ${userUserToken}`
//             }
//         });
//         expect(response.status).toBe(403)
//     });

//     test('User can update their metadata with an avatar id', async() => {
//         const response = await axios.patch(`${BACKEND_URL}/user/metadata?avatar_id=${avatarId}`,{} ,{
//             headers: {
//                 'Authorization': `Bearer ${userUserToken}`
//             }
//         });

//         expect(response.status).toBe(200)
//     });

//     test('User cannot update due to no login token', async () => {
//         const response = await axios.patch(`${BACKEND_URL}/user/metadata?avatar_id=${avatarId}`);
//         expect(response.status).toBe(403)
//     });

//     test('User can get all avatars', async () => {
//         const response = await axios.get(`${BACKEND_URL}/user/avatars`);
//         expect(response.status).toBe(200);
//         expect(response.data.data).toBeDefined()
//         expect(response.data.data.length).not.toBe(0)
//     });

//     test('User can get other avatars', async () => {
//         const response = await axios.get(`${BACKEND_URL}/user/metadata/bulk?ids=[${userUserId}]`, {
//             headers: {
//                 'Authorization': `Bearer ${userUserToken}`
//             }
//         });
//         console.log(response, "response");
//         expect(response.status).toBe(200);
//         expect(response.data.data).toBeDefined();
//         expect(response.data.data.length).not.toBe(0);
//         expect(response.data.data.find(x => x.id === userUserId))
//     });
// })

