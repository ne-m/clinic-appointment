let userInitials;

export async function getProfile(token) {
    const res = await fetch("https://clinic-appointment-4lxl.onrender.com/api/user/profile", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "token": `${token}`
        }
    });

    let data = await res.json();

    if (data.success) {
        setInitials(data)
        return data.userData;
    } else {
        console.log(data.message);
    }
}

function setInitials(data) {
    localStorage.setItem("initials", `${data.userData.first_name.charAt(0)}${data.userData.last_name.charAt(0)}`);
    return;
}

export function getInitials(av) {
    av.innerHTML = localStorage.getItem('initials')
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