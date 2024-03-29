//COLLECTION
var todos = [];
if (localStorage.getItem('todos')){
    todos = JSON.parse(localStorage.getItem('todos'));
    renderView();
};

//MODEL
function Todo(obj){
    this.title = obj.title || '';
    this.completed = obj.completed || false;
};

//VIEW-RELATED
function renderView(){
    var main = document.getElementById('main');
    var footer = document.getElementById('footer');
    var correctStyle = (todos.length > 0)?'block':'none';
    if (main.style.display !== correctStyle){
        main.style.display = correctStyle;
        footer.style.display = correctStyle;
    };

    renderTodos(todos);
    renderFooter(todos);
};

function renderTodos(todos){
    //filters based on url hash
    var localTodos = todos.filter(getFilter());

    //there was a bug where the __data__ on the list item was correct
    //but the text in the label wasn't updating.  enter function working
    //but doing update wrong?
    //this also clears event handlers
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

    var completed = todos.filter(function(todo){return todo.completed});
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
    var editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.classList.add('edit');
    editInput.value = todo.title;
    editInput.addEventListener('keypress', function(e){
        //escape key
        if (e.keyCode === 27){
            li.classList.remove('editing');
            this.value = todo.title;

        //enter key
        } else if (e.keyCode === 13){ 
            li.classList.remove('editing');
            label.textContent = this.value;
            for (var i = 0; i<todos.length; i++){
                if (todos[i].title === todo.title){
                    todos[i].title = this.value;
                    break;
                };
            };
            renderView();
        };
    });

    li.appendChild(editInput);

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

//navigating away from the page triggers list to be saved in localStorage
window.addEventListener('unload', function(e){
    localStorage.setItem('todos', JSON.stringify(todos));
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

//double-clicking an item to edit it
ul.addEventListener('dblclick', function(e){
    if (e.target.tagName === 'LABEL'){
        var li = parentListItem(e.target);
        li.classList.add('editing');
    };
});

//clicking "clear completed" button
var completedButton = document.getElementById('clear-completed');
completedButton.addEventListener('click', function(e){
    todos = todos.filter(function(todo){return !todo.completed});
    renderView();
});

var toggleAll = document.getElementById('toggle-all');
toggleAll.addEventListener('click', function(e){
    for (var i = 0; i<todos.length; i++){
        todos[i].completed = this.checked;
    };
    renderView();
});
