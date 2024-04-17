# medical-api

## Why run this?
If you don't run this you won't be able to do CRUD on the [medical-dash](https://github.com/JosephTNW/medical-dash) project. Note that being able to do CRUD is the main requirement of this project.

## Prerequisites
1. Working XAMPP / MySQL Local Database
2. Import the data on `cvd_cleaned.csv` to the MySQL database. You have two options here:

   *Import through .sql file on the [drive](https://drive.google.com/file/d/1KfGiWeAwyI9aYrajByQi_S7PCVTHvDgD/view?usp=drive_link) (EASY)*
   - Create a new database
   - Import the .sql file

   *Import the csv (HARD)*
   - Put the file `cvd_cleaned.csv` to your `xampp/mysql/data/yourdbname` directory
   - Go to import section
   - Select your file on the selector
   - Enable the option `The first line of the file contains the table column names (if this is unchecked, the first line will become part of the data)`
   - Press Import
   - The resulted table will be truncated due to timeout
   - Truncate the whole table
   - Go to the SQL section and input the following query:
     ```LOAD DATA INFILE 'c:/cvd_cleaned.csv'
     IGNORE INTO TABLE your_prev_table_name
     FIELDS TERMINATED BY ',' ENCLOSED BY '"'
     LINES TERMINATED BY '\n'```
   - There may be additional truncation, edit the fields character limit to solve this issue
   - Delete the first row if it is indeed the column names.

## How to run this?
1. First create a .env file using the available .env_example as a template.
2. Open command prompt on the medical-api's root directory.
3. Execute `npm i` to install all required libraries
4. Execute `npm start` to automatically run the mysql_index.js script.
5. To test you can go to localhost:3050 and type in an available request route.
6. On the medical-dash, create a .env file based on the .env_example available there too.
