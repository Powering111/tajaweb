const practice_select_elem = document.getElementById('practice-select');
for(let content in content_list){
    const elem = document.createElement('option');
    elem.value = content;
    if(content_list[content].author?.length){
        elem.innerText=content_list[content].author + " - " + content_list[content].title;
    }
    else{
        elem.innerText=content_list[content].title;
    }
    practice_select_elem.appendChild(elem);
}

function start(){
    const selected_content = content_list[practice_select_elem.value];
    if(selected_content.author?.length){
        document.getElementById('title-label').innerText=selected_content.author + " - " + selected_content.title;
    }
    else{
        document.getElementById('title-label').innerText=selected_content.title;
    }
    practice_start(selected_content.content);
}

function now(){
    return new Date().getTime();
}

let start_time;
let view_time_interval;
const practice_count = 4;
let practice_lines;
const practice_container_elem = document.getElementById('practice-container');
const elapsed_time_elem = document.getElementById('elapsed-time');
const character_count_elem = document.getElementById('character-count');
const character_count_label_elem = document.getElementById('character-count-label');
const wrong_count_label_elem = document.getElementById('wrong-count-label');
const speed_elem = document.getElementById('speed');
const speed_label_elem = document.getElementById('speed-label');
const accuracy_elem = document.getElementById('accuracy');
const accuracy_label_elem = document.getElementById('accuracy-label');

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
    start_time = now();
    
    if(view_time_interval){
        clearInterval(view_time_interval);
    }
    view_time_interval = setInterval(view_time,100);
    let sumChars=0;
    for(let line of practice_lines){
        sumChars+=line.length;
    }
    character_count_elem.max=sumChars;

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

function view_time(){
    //view time
    const elapsedTime = now() - start_time;
    elapsed_time_elem.innerText = `${Math.floor(elapsedTime/360000)}:${String("0"+Math.floor(elapsedTime/60000)).slice(-2)}:${String("0"+Math.floor(elapsedTime/1000)%60).slice(-2)}`;
    let typedChars = 0, wrongChars=0;
    for(let line of practice_line_results){
        for(let i=0;i<line.length;i++){
            if(line[i]=='y'){
                typedChars++;
            }
            else if(line[i]=='n'){
                wrongChars++;
            }
        }
    }
    character_count_elem.value=typedChars;
    wrong_count_label_elem.innerText=wrongChars;
    
    character_count_label_elem.innerText=`${typedChars}/${character_count_elem.max}`;

    let speed = 0;
    if(typedChars){
        speed = typedChars/(elapsedTime/60000);
    }
    speed_elem.value=speed;
    speed_label_elem.innerText = `${speed}`;
    let accuracy = 100;
    if(typedChars+wrongChars>0){
        accuracy=typedChars/(typedChars+wrongChars)*100;
    }
    accuracy_elem.value=accuracy;
    accuracy_label_elem.innerText = `${accuracy}%`;


}
function view_page(){
    if(viewing_page<1) viewing_page=1;
    if(viewing_page>page_count) viewing_page=page_count;

    view_time();

    //view lines
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

    // page num
    page_label_elem.innerText=`${viewing_page} / ${page_count}`;
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
            if(i!=inputText.length-1 || force){
                practice_line_results[now_line]+='n';
            }
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
        clearInterval(view_time_interval);
        practicing=false;
        alert("practice complete!");
    }

    if(now_line%practice_count==0){
        now_page++;
        viewing_page=now_page;
    }
    view_page();
}

