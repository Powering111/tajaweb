
const practice_select_elem = document.getElementById('practice-select');
for(let content in content_list){
    const elem = document.createElement('option');
    elem.value = content;
    elem.innerText=content_list[content].author + " - " + content_list[content].title;
    practice_select_elem.appendChild(elem);
}

function start(){
    const selected_content = content_list[practice_select_elem.value];
    document.getElementById('title-label').innerText=selected_content.author + ' - ' + selected_content.title;
    practice_start(selected_content.content);
}

const practice_count = 4;
let practice_lines;
const practice_container_elem = document.getElementById('practice-container');
let practice_view_elem = [];
let practice_input_elem = [];
let practice_inputs = [];
let practice_line_results = [];
const page_label_elem = document.getElementById('page-label');
let now_page=1, now_line=1, viewing_page=1;
let page_count;
let practicing=false;
let initialized =false;
function initialize(){
    practice_container_elem.innerHTML='';
    practice_view_elem = [];
    practice_input_elem = [];
    
    for(let i=0;i<practice_count;i++){
        const elem = document.createElement('div');
        elem.classList.add('practice-section');
        elem.innerHTML = `<p id="practice-view-${i}" class="practice-view"></p><input type="text" id="practice-input-${i}" class="practice-input" oninput="input_listener(event)" onkeydown="keydown_listener(event)">`;
        practice_container_elem.appendChild(elem);
    }
    
    for(let i=0;i<practice_count;i++){
        practice_view_elem.push(document.getElementById(`practice-view-${i}`));
        practice_input_elem.push(document.getElementById(`practice-input-${i}`));
    }

    initialized=true;
}

function practice_start(content){
    if(!initialized) initialize();
    practice_inputs = [];
    practice_line_results = [];
    practice_lines = split_content(content);
    now_page=1;
    viewing_page=1;
    now_line=0;
    page_count=Math.ceil(practice_lines.length/practice_count);

    practicing=true;
    view_page();
}

function split_content(content, char_per_line=40){
    const result = [];
    const lines = content.split('\n');
    for(let line of lines){
        line=line.trim();
        if(line.length<=char_per_line){
            result.push(line);
        }
        else{
            const words = line.split(' ');
            let new_line = '';
            for(let word of words){
                if (new_line.length+word.length<=char_per_line){
                    new_line+=word+' ';
                }
                else{
                    new_line=new_line.trim();
                    result.push(new_line);
                    new_line=word+' ';
                }
            }
            new_line=new_line.trim();
            result.push(new_line);
        }
    }

    return result;
}

function view_page(){
    if(viewing_page<1) viewing_page=1;
    if(viewing_page>page_count) viewing_page=page_count;
    for(let i=0;i<practice_count;i++){
        const processing_line = (viewing_page-1)*practice_count+i; //now processing line (absolute)
        const line = practice_lines[processing_line];
        if(typeof line !== "undefined"){
            practice_view_elem[i].innerHTML='';
            const result = practice_line_results[processing_line] ?? '';
            let d_s='y';
            let d_str='';
            let j=0;
            const result_class_map = {'y':'right','n':'wrong'};
            for(;j<result.length;j++){
                if(d_s==result[j]){
                    d_str+=line[j];
                }
                else{
                    if(d_str.length>0){
                        const elem = document.createElement('span');
                        elem.classList.add(result_class_map[d_s]);
                        elem.classList.add('display-text');
                        elem.innerText=d_str;
                        practice_view_elem[i].appendChild(elem);
                    }
                    d_str='';
                    d_str+=line[j];
                    d_s=result[j];
                }
            }
            if(d_str.length>0){
                const elem = document.createElement('span');
                elem.classList.add(result_class_map[d_s]);
                elem.classList.add('display-text');
                elem.innerText=d_str;
                practice_view_elem[i].appendChild(elem);
            }
            d_str='';
            for(;j<line.length;j++){
                d_str+=line[j];
            }
            const elem = document.createElement('span');
            elem.classList.add('display-text');
            elem.innerText=d_str;
            practice_view_elem[i].appendChild(elem);
        }
        else{
            practice_view_elem[i].innerHTML = "&nbsp;";
        }
        
        const saved_input=practice_inputs[processing_line];
        if(typeof saved_input !== "undefined"){
            practice_input_elem[i].value=saved_input;
        }
        else{
            practice_input_elem[i].value='';
        }

        if(practicing && processing_line == now_line){
            practice_input_elem[i].disabled=false;
            practice_input_elem[i].focus();
        }
        else{
            practice_input_elem[i].disabled=true;
        }
    }

    page_label_elem.innerText=viewing_page;
}

function process_input(force=false){
    if(!practicing) return;
    const inputText = practice_input_elem[now_line%practice_count].value;
    const realText = practice_lines[now_line];
    practice_inputs[now_line]=inputText.substr(0,realText.length);
    practice_line_results[now_line]='';
    for(let i=0;i<inputText.length&&i<realText.length;i++){
        if(realText[i]==inputText[i]){
            practice_line_results[now_line]+='y';
        } else{
            practice_line_results[now_line]+='n';
        }
    }

    if(force&&inputText.length>=realText.length){
        next_line();
    }
    else if(inputText.length>realText.length){
        next_line();
    }
    view_page();
}

function input_listener(event){
    if(event.target.classList.contains('practice-input')){
        process_input();
    }
}

function keydown_listener(event){
    if(event.target.classList.contains('practice-input')){
        if(event.key=="Enter"){
            process_input(force=true);
        }
    }
}

function view_next_page(){
    viewing_page++;
    view_page();
}

function view_now_page(){
    viewing_page=now_page;
    view_page();
}

function view_prev_page(){
    viewing_page--;
    if(viewing_page<=0)viewing_page=0;
    view_page();
}

function next_line(){
    now_line++;
    if(now_line >= practice_lines.length){
        alert("practice complete!");
        practicing=false;
    }

    if(now_line%practice_count==0){
        now_page++;
        viewing_page=now_page;
    }
    view_page();
}