create table users(id serial,username text,birth_day integer,birth_month integer,birth_year integer,birth_minute integer,birth_hour integer);
create table signs(id serial,sign_name text,symbol text,strengths text,weaknesses text,element text,ruler text,jewelry text,yinyang boolean);
create table compatibility(id serial,signId integer,compatibleSignId integer);
create table incompatibility(id serial,signId integer,incompatibleSignId integer);
create table numbers(id serial,signId integer,number integer);
create table colors(id serial,signId integer,color text);
create table flowers(id serial,signId integer,flower text);
create table directions(id serial,signId integer,direction integer);