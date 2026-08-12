
const btn=document.querySelector('.menu-btn');
const nav=document.querySelector('.navlinks');
if(btn&&nav){btn.addEventListener('click',()=>nav.classList.toggle('open'));}
document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
