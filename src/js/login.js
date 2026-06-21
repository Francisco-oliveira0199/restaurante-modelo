const btnLogin =
document.getElementById("btnLogin");

const btnCadastro =
document.getElementById("btnCadastro");

const formLogin =
document.getElementById("formLogin");

const formCadastro =
document.getElementById("formCadastro");

btnLogin.addEventListener(
"click",
() => {

btnLogin.classList.add("active");
btnCadastro.classList.remove("active");

formLogin.style.display = "flex";
formCadastro.style.display = "none";

}
);

btnCadastro.addEventListener(
"click",
() => {

btnCadastro.classList.add("active");
btnLogin.classList.remove("active");

formCadastro.style.display = "flex";
formLogin.style.display = "none";

}
);

formCadastro.addEventListener(
"submit",
async e => {

e.preventDefault();

const usuario = {

nome:
document.getElementById(
"cadastroNome"
).value,

email:
document.getElementById(
"cadastroEmail"
).value,

senha:
document.getElementById(
"cadastroSenha"
).value

};

const response =
await fetch(
"http://localhost:3000/auth/register",
{
method:"POST",
headers:{
"Content-Type":
"application/json"
},
body:
JSON.stringify(usuario)
}
);

const data =
await response.json();

alert(
data.mensagem ||
"Conta criada!"
);

}
);

formLogin.addEventListener(
"submit",
async e => {

e.preventDefault();

const response =
await fetch(
"http://localhost:3000/auth/login",
{
method:"POST",
headers:{
"Content-Type":
"application/json"
},
body:
JSON.stringify({
email:
document.getElementById(
"loginEmail"
).value,
senha:
document.getElementById(
"loginSenha"
).value
})
}
);

const data =
await response.json();

if(data.token){

localStorage.setItem(
"token",
data.token
);

localStorage.setItem(
"usuario",
JSON.stringify(
data.usuario
)
);

window.location.href =
"index.html";

}else{

alert(
"Login inválido"
);

}

}
);

document
.getElementById("googleLogin")
.addEventListener(
"click",
() => {

window.location.href =
"http://localhost:3000/auth/google";

}
);