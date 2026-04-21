export async function getProfile(token) {
    const res = await fetch("http://localhost:4000/api/user/profile", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "token": `${token}`
        }
    });

    let data = await res.json();

    if (data.success) {
        // userDetails = data.userData;
        return data.userData;
    } else {
        console.log(data.message);
    }
}


function parseJwt(token) {
    return JSON.parse(atob(token.split('.')[1]));
}

export function saveToLocalStorage(token) {
    localStorage.setItem("token", token);
}

export function getToken(){
    let token = localStorage.getItem("token")
    return;
}