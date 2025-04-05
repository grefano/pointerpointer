CREATE DATABASE teste_app;
USE teste_app;

CREATE TABLE notes{
    id integer primary key AUTO_INCREMENT,
    title varchar(255) not null
};

insert into notes {title, about}
values
{'nota 1', 'nota sobre algo mt legal'}
{'nota 2', 'nota sobre algo mt legal de novo'};