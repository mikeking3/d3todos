//global list of items
var todos = [];

//i want the div to toggle based on whether there are any todos 
//or not.  not sure how to accomplish this with d3 yet
todos.toggleMain = function(){
    var main = document.getElementById('main');
    var footer = document.getElementById('footer');
    var correctStyle = (this.length > 0)?'block':'none';
    if (main.style.display !== correctStyle){
        main.style.display = correctStyle;
        footer.style.display = correctStyle;
    };
};

//adding a new item
var newItemInput = d3.select('#new-todo');

newItemInput.on('keypress', function(d, i){
    if (d3.event.keyCode === 13){
        //add new item
        todos.push(new Todo({title: this.value}));

        //prepare input field for next item
        this.value = '';
        
        //show div#main if hidden
        todos.toggleMain();

        //render the view
        renderTodos(todos);
    };
});

function renderTodos(todos){
    //insert new item into DOM
    d3.select('#todo-list')
        .selectAll('li')
        .data(todos)
        .enter()
        .append(makeListItem);
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

//class definition
function Todo(obj){
    this.title = obj.title || '';
    this.completed = obj.completed || false;
};

