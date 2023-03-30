let info;

fetch('info.json').then(data => data.json()).then(data => info=data);

function SetupHome(){
    const card = document.querySelector('.card').cloneNode(true); document.querySelector('.card').remove();
    Object.keys(info.piatti).forEach(type => {
        const c = card.cloneNode(true);
        c.querySelector('.title').textContent = type.toUpperCase().slice(0,1)+type.slice(1);
        let list = [];
        let len = 0;
        info.piatti[type].list.forEach(piatto => {
            if(len > 15) return;
            const n = piatto.title;
            list.push(n);
            len+=n.length;
        })
        c.querySelector('.desc').textContent = list.join(', ')+'...';
        c.querySelector('.img').style.background = `url(${info.piatti[type].img})`;
        c.setAttribute('type', type);
        document.querySelector('.cards').appendChild(c);
    })
}

function SetupMenu(){
    const it = document.querySelector('.title').cloneNode(true); document.querySelector('.title').remove();
    const ic = document.querySelector('.item').cloneNode(true); document.querySelector('.item').remove();
    Object.keys(info.piatti).forEach(type => {
        const t = it.cloneNode(true);
        t.classList.add(type);
        document.querySelector('.options').appendChild(t);
        t.querySelector('h1').textContent = type.toUpperCase();
        info.piatti[type].list.forEach(dish => {
            const p = ic.cloneNode(true);
            p.querySelector('.name').textContent = dish.title;
            p.querySelector('.price').textContent = '€'+dish.price;
            p.setAttribute('classn', type);
            p.setAttribute('index', info.piatti[type].list.indexOf(dish));
            if(dish.noP != undefined)
                p.classList.add('noP');
            dish.contains.forEach(d => {
                p.querySelector(`.contains > .${d}`).style.display = 'unset';
            })
            document.querySelector('.options').appendChild(p);
        })
    })
}

function OpenPreview(){
    document.querySelector('.container').style['overflow-y']  = 'hidden';
    document.querySelector('.slidecard').style.transform = "translate(-50%, 0)";
}

function ClosePreview(){
    document.querySelector('.container').style['overflow-y'] = 'auto';
    document.querySelector('.slidecard').style.transform = "translate(-50%, 100%)";
}

const funcsP = {
    home: SetupHome,
    menu: SetupMenu,
}

const PInfo = document.querySelector('.slidecard > .content')
const constfuncs = {
    home: function(){
        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('click', () => {
               setTimeout(() => {
                 SwitchP(bar.querySelectorAll('div')[1], function(){
                    setTimeout(() => {
                        document.querySelector(`.${card.getAttribute('type')}`).scrollIntoView();
                    }, 50);
                 });
               }, 100);
            })
        })
    },
    menu: function(){
        document.querySelectorAll('.item').forEach(item => {
            const plate = info.piatti[item.getAttribute('classn')].list[item.getAttribute('index')];
            if(plate.noP != undefined) return;
            item.addEventListener('click', () => {
                PInfo.querySelector('.ingredients').textContent = plate.desc;
                PInfo.querySelector('.ing').style.display = plate.desc.length > 0 && 'block' || 'none';
                let c = false;
                PInfo.querySelectorAll(`.contains > div`).forEach(el => el.style.display = 'none')
                plate.contains.forEach(all => {
                    c = true;
                    PInfo.querySelector(`.contains :has(.${all})`).style.display = 'flex';
                })
                PInfo.querySelector('.warn').style.display = c && 'block' || 'none';
                OpenPreview();
            })
        })
    }
}

async function LoadPage(){
    return new Promise(async function(resolve){
        document.querySelector('.wrapper').style.opacity = 0;
        let data, css;
        if(cache[sel.getAttribute('name')] != undefined)
            data = cache[sel.getAttribute('name')];
        else{
            try{
                data = await fetch("pages/"+sel.getAttribute('name')+".html");
                data = await data.text();
            }catch(err){
                await LoadPage().then(resolve());
            }
        }
        if(cache[sel.getAttribute('name')+".css"] != undefined)
            css = cache[sel.getAttribute('name')+".css"];
        else{
            try{
                css = await fetch("pages/"+sel.getAttribute('name')+".css");
                css = await css.text();
            }catch(err){
                await LoadPage().then(resolve());
            }
        }
        document.querySelector('.pagestyle').innerHTML = css;
        if(funcsP[sel.getAttribute('name')] && cache[sel.getAttribute('name')] == undefined)
            setTimeout(() => {
                funcsP[sel.getAttribute('name')]();
            }, 10);
        setTimeout(() => {
            if(constfuncs[sel.getAttribute('name')]) constfuncs[sel.getAttribute('name')]();
        }, 10);
        document.querySelector('.wrapper').style.display = 'none';
        document.querySelector('.wrapper').innerHTML = cache[sel.getAttribute('name')] != undefined && cache[sel.getAttribute('name')] || data;
        setTimeout(() => {
            document.querySelector('.wrapper').style.display = 'initial';
            setTimeout(() => {
                document.querySelector('.wrapper').style.opacity = 1;
            }, 10);
        }, 10);
        resolve();
    })
}

let cache = {};

const bar = document.querySelector('.bar');
let sel = document.querySelector('.selected');
bar.querySelectorAll('div').forEach(el => {
    el.addEventListener('click', function(){
        SwitchP(el);
    })
})

async function SwitchP(el, callback){
    if(el == sel) return;
    ClosePreview()
    cache[sel.getAttribute('name')] = document.querySelector('.wrapper').innerHTML;
    cache[sel.getAttribute('name')+".css"] = document.querySelector('.pagestyle').innerHTML;
    sel.classList.remove('selected');
    el.classList.add('selected');
    sel = el;
    await LoadPage();
    if(callback) callback();
}

LoadPage()