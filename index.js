function NavBtn () {
    const target_id = this.event.target.attributes.id.value;
    if (target_id.includes('about')){
        location.href = '/about.html';
    }else if (target_id.includes('contact')){
        location.href = '/contact.html';
    }else if (target_id.includes('docu')){
        location.href = '/documentation.html';
    }else{
        location.href = '/index.html';
    }
}