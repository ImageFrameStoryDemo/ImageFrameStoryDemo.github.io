// below is image part
function add(){
    $("#input_images").css('opacity', 0.25);
    $("#button_area").css('opacity', 0.25);

    document.getElementById("default_images_and_add").removeAttribute('hidden');
    put_image_pool()
}

function submit(){
    //console.log('click submit');

    // remove previous state
    /*
    for (index=1; index <= 5; index ++){
        var usedFrameList = document.getElementById('usedFrameList'+String(index));
        while (usedFrameList.firstChild) {
            usedFrameList.removeChild(usedFrameList.firstChild);
        }
    }
    for (index=1; index <= 5; index ++){
        var sep_story = document.getElementById('sep_story'+String(index));
        sep_story.innerHTML = "";
    }
    */

    // order files
    var childs = document.getElementById("input_images").childNodes;
    var arr = []
    if (childs.length != 5) {
        alert("Must use 5 images");
        return;
    }
    for (let index=0; index < childs.length; index ++) {
        child = childs[index];
        //console.log('child', child);
        if (child.id.startsWith("default")) {
            var img = document.getElementById(child.id);
            arr.push(child.src);
        }
        else {
            arr.push(files[child.id]);
        }
    }
    //console.log(arr)
    
    socket.emit("img", arr);
    
    $("#waiting_img").css("display", "block");
    $("#input_images").css('opacity', 0.25);
    $("#button_area").css('opacity', 0.25);
    
    
}

function add_from_device(){
    alert('The implementation of this function is postpone due to the SSL issue.')
}
function use_these_images(){
    var images = document.getElementById("default_images").childNodes;
    var selected_images = [];
    for (let i=0; i<images.length; i++) {
        if (images[i].classList.contains('selected_image')){
            selected_images.push(images[i]);
        }
    }
    if (selected_images.length != 5){
        alert('Can only use 5 images');
        return;
    }
    else {
        var input_images = document.getElementById("input_images");
        var width = input_images.clientWidth*0.8;
        for (let i=0; i<selected_images.length; i++){
            var image = selected_images[i];
            image.classList.remove('selected_image');
            image.classList.add('used_image');
            image.width = width;
            image.height = width;
            input_images.appendChild(image);
        }
    }
    document.getElementById("default_images_and_add").hidden = true;
    $("#input_images").css('opacity', 1);
    $("#button_area").css('opacity', 1);
}



function put_image_pool(){
    var default_image = document.getElementById("default_images");
    for (var i=0; i<=27; i++){
        var dimg = document.createElement("img");
        dimg.className += 'un_select_image';
        dimg.setAttribute('src', 'default_images/'+i.toString()+'.jpg');
        dimg.setAttribute('id', 'default_images/'+i.toString()+'.jpg');
        var size = (document.getElementById("default_images").clientWidth) / 3.5;
        if (size > 178) {
            size = 178;
        }
        dimg.setAttribute('height', size.toString());
        dimg.setAttribute('width', size.toString());
        default_image.append(dimg);
        dimg.onclick = function(e){
            if (this.classList.contains('un_select_image')){
                this.classList.remove('un_select_image');
                this.classList.add('selected_image');
            }else if(this.classList.contains('selected_image')){
                this.classList.remove('selected_image');
                this.classList.add('un_select_image');
            }
        }
        
    }
}

// below is frame part

socket.on('frames', function (frameObjLists){
    $("#waiting_img").css("display", "none");
    $("#input_images").css("display", "none");
    $("#button_area").css('display', "none");
    $("#images_and_frames_and_buttons").css('display', "initial");

    // frameLists is list of list of frame
    console.log('receive frameLists:', frameObjLists);

    // put image and corresponding frames
    var images = document.getElementById("input_images").childNodes;
    images = Array.prototype.slice.call(images);
    
    var images_and_frames = document.getElementById("images_and_frames");
    for (let i=0; i<frameObjLists.length; i++){
        console.log('before', images);
        put_image_and_frame(images_and_frames, images[i], frameObjLists[i]);
        console.log('after', images);
    }
    
});

function put_image_and_frame(result_DOM, image, frameList){
    var div = document.createElement("div");
    div.className += 'image_and_frame';
    console.log(image);
    div.appendChild(image);
    for (let i=0; i<frameList.length; i++){
        var single_frame = document.createElement("div");
        single_frame.classList.add("single_frame");
        single_frame.innerHTML = frameList[i].name;
        div.appendChild(single_frame);
    }
    result_DOM.appendChild(div);
}

// below is story part
function generate_story(){
    var images_and_frames = document.getElementById("images_and_frames").childNodes;
    console.log(images_and_frames);
    images_and_frames = Array.prototype.slice.call(images_and_frames);
    console.log(images_and_frames);
    var framesList = [];
    for (let i=0; i<images_and_frames.length; i++){
        // image_and_frames is a div with a image and its corresponding frames
        const image_and_frames = images_and_frames[i];
        frames = image_and_frames.getElementsByClassName('single_frame');
        var arr = [];
        for (const frame of frames){
            frame_string = frame.innerHTML.split('<div>')[0];
            /*
            if (frame.classList.contains("noun_type")) {
                frame += "_NOUN";
            }
            else if (frame.classList.contains("frame_type")) {
                frame += "_Frame";
            }
            */
           arr.push(frame_string);
        }
        framesList.push(arr);
    }
    socket.emit("frames", framesList);
    $("#waiting_img").css("display", "block");
    $("#images_and_frames_and_buttons").css('opacity', 0.25);
}

socket.on('story', function (storys){
    $("#images_and_frames_and_buttons").css('display', "none");
    $("#waiting_img").css("display", "none");
    $("#gallery").css('display', "initial");
    $("body").css('display', 'initial');
    console.log('receive storys:', storys);
    
    var mySwiper = new Swiper ('.swiper-container', {
        // Optional parameters
        initialSlide: 2,
    
        // If we need pagination
        pagination: {
        el: '.swiper-pagination',
        },
    });
    const height = put_images();
    put_storys(height, storys);
    put_terms(height);       
});

function put_images(){
    var DOM = document.getElementById("show_images");
    var images_and_frames = document.getElementById("images_and_frames").childNodes;
    console.log(images_and_frames);
    images_and_frames = Array.prototype.slice.call(images_and_frames);
    const width = DOM.clientHeight*0.18;
    for (let i=0; i<images_and_frames.length; i++){
        // image_and_frames is a div with a image and its corresponding frames
        const image_and_frames = images_and_frames[i];
        var image = image_and_frames.getElementsByTagName('img')[0];
        console.log(image);
        image = image.cloneNode(true);
        image.width = width;
        image.height = width;
        image.classList.add('showing');
        DOM.appendChild(image);
    }
    var DOM = document.getElementById("show_images2");
    var images_and_frames = document.getElementById("images_and_frames").childNodes;
    images_and_frames = Array.prototype.slice.call(images_and_frames);
    for (let i=0; i<images_and_frames.length; i++){
        // image_and_frames is a div with a image and its corresponding frames
        const image_and_frames = images_and_frames[i];
        var image = image_and_frames.getElementsByTagName('img')[0];
        console.log(image);
        image = image.cloneNode(true);
        image.width = width;
        image.height = width;
        image.classList.add('showing');
        DOM.appendChild(image);
    }
    return width;
}

function put_terms(height){
    var DOM = document.getElementById("show_terms");
    
    var images_and_frames = document.getElementById("images_and_frames").childNodes;
    console.log(images_and_frames);
    images_and_frames = Array.prototype.slice.call(images_and_frames);
    for (let i=0; i<images_and_frames.length; i++){
        // image_and_frames is a div with a image and its corresponding frames
        const image_and_frames = images_and_frames[i];
        single_terms = image_and_frames.getElementsByClassName('single_frame');
        //console.log('single_terms', single_terms);
        var div = document.createElement("div");
        //div.style.width = height;
        div.style.height = height;
        div.classList.add('showing_terms');
        for (single_term of single_terms){
            single_term = single_term.cloneNode(true);
            div.appendChild(single_term);
        }
        DOM.appendChild(div);
    }
}

function put_storys(height, storys){
    var DOM = document.getElementById("show_storys");
    var images_and_frames = document.getElementById("images_and_frames").childNodes;
    images_and_frames = Array.prototype.slice.call(images_and_frames);
    for (let i=0; i<images_and_frames.length; i++){
        // image_and_frames is a div with a image and its corresponding frames
        var div = document.createElement("div");
        //div.style.width = height;
        div.style.height = height;
        div.classList.add('showing');
        div.innerHTML = storys[i];
        DOM.appendChild(div);
    }
    
}