//COLLECTION
var todos = [];

//i want the div to toggle based on whether there are any todos 
//or not.  not sure how to accomplish this with d3 yet
todos.toggleVisibility = function(){
    var main = document.getElementById('main');
    var footer = document.getElementById('footer');
    var correctStyle = (this.length > 0)?'block':'none';
    if (main.style.display !== correctStyle){
        main.style.display = correctStyle;
        footer.style.display = correctStyle;
    };
};

//MODEL
function Todo(obj){
    this.title = obj.title || '';
    this.completed = obj.completed || false;
};

//VIEW-RELATED
function renderView(){
    renderTodos(todos);
    renderFooter(todos);
};

function renderTodos(todos){
    //filters based on url hash
    var localTodos = todos.filter(getFilter());

    //there was a bug where the __data__ on the list item was correct
    //but the text in the label wasn't updating.  enter function working
    //but doing update wrong?
    document.getElementById('todo-list').innerHTML = '';

    //insert new item into DOM
    d3.select('#todo-list')
        .selectAll('li')
        .data(localTodos)
        .enter()
        .append(makeListItem);

    //update existing nodes
    d3.select('#todo-list')
        .selectAll('li')
        .data(localTodos)
        .classed(function(d){
            return d.completed?'completed':'';
        });

    //remove elements filtered out by user
    d3.select('#todo-list')
        .selectAll('li')
        .data(localTodos)
        .exit()
        .remove();
};

function renderFooter(todos){
    var  active = todos.filter(function(todo){return !todo.completed});
    document.querySelector('#todo-count strong').textContent = active.length;
    document.querySelector('#todo-count span').textContent = (todos.length === 1)?'item':'items';

    var hash = location.hash || '#';
    var links = document.querySelectorAll('#filters a');
    for (var i = 0; i<links.length; i++){
        if (links[i].hash === hash ||
            (links[i].hash === '' && hash === '#')){
            links[i].classList.add('selected');
        } else {
            links[i].classList.remove('selected');
        };
    };

    var  completed = todos.filter(function(todo){return todo.completed});
    if (completed.length > 0){
        var count = document.querySelector('#clear-completed span');
        count.textContent = completed.length;
        document.getElementById('clear-completed').style.display = 'block';
    } else {
        document.getElementById('clear-completed').style.display = 'none';
    };
};

//rendering a new item
function makeListItem(todo){
    //outermost layer
    var li = document.createElement('li');

    //first child
    var container = document.createElement('div');
    container.classList.add('view');

    //checkbox
    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.classList.add('view');
    if (todo.completed){
        checkbox.checked = true;
        li.classList.add('completed');
    };


    //label
    var label = document.createElement('label');
    label.textContent = todo.title;

    //button
    var button = document.createElement('button');
    button.classList.add('destroy');

    container.appendChild(checkbox);
    container.appendChild(label);
    container.appendChild(button);

    li.appendChild(container);

    //second child
    var editButton = document.createElement('input');
    editButton.type = 'text';
    editButton.classList.add('edit');
    editButton.value = todo.title;

    li.appendChild(editButton);

    return li;
};

//"ROUTER"
function getFilter(){
    if (location.hash === '#completed'){
        return function(todo){
            return todo.completed;
        };
    } else if (location.hash === '#active'){
        return function(todo){
            return !todo.completed;
        };
    } else {
        return function(todo){
            return true;
        };
    };
};

window.addEventListener('hashchange', function(e){

    renderView();
});

//CONTROLLER

//utility function
function parentListItem(el){
    var li = undefined;
    var current = el;
    var parent = undefined;
    while (current !== null){
        var parent = current.parentElement;
        if (parent && parent.tagName === 'LI'){
            break;
        };
        current = parent;
    };
    return parent;
};

//react to new item
var newItemInput = d3.select('#new-todo');
newItemInput.on('keypress', function(d, i){
    if (d3.event.keyCode === 13){
        //add new item
        todos.push(new Todo({title: this.value}));

        //prepare input field for next item
        this.value = '';
        
        //show div#main if hidden
        todos.toggleVisibility();

        renderView();
    };
});

var ul = document.getElementById('todo-list');

//clicking "item complete" checkbox
ul.addEventListener('click', function(e){
    if (e.target.type === 'checkbox'){
        var li = parentListItem(e.target);
        li.className = e.target.checked?'completed':'';

        var title = li.__data__.title;

        //update model
        for (var i = 0; i<todos.length; i++){
            if (todos[i].title === title){
                todos[i].completed = e.target.checked;
                break;
            };
        };
        renderView();
    };
});

//clicking "remove item" button
ul.addEventListener('click', function(e){
    if (e.target.tagName === 'BUTTON' && e.target.classList.contains('destroy')){
        var li = parentListItem(e.target);
        var title = li.__data__.title;

        var index = 0;
        for (var i = 0; i<todos.length; i++){
            if (todos[i].title === title){
                index = i;
                break;
            };
        };
        todos.splice(index, 1);
        renderView();
    };
});

//clicking "clear completed" button
ul.addEventListener('click', function(e){
    if (e.target.id === 'clear-completed'){
    };
});
