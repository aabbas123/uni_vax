CREATE DATABASE univax;
CREATE TABLE users(
user_id UUID  DEFAULT uuid_generate_v4(),


user_email VARCHAR(255) NOT NULL UNIQUE,
user_phone VARCHAR(25) NOT NULL,
user_password VARCHAR(255) NOT NULL,
reset_token VARCHAR(255),
verification_token VARCHAR(255),
isverified BOOLEAN,
token VARCHAR(255),


PRIMARY KEY (user_id)


);

CREATE TABLE vaccine_detail(
    vax_id SERIAL,   
    
    vax_name VARCHAR(255) NOT NULL,
    vax_date VARCHAR(255) NOT NULL,
    Name_of_Provider VARCHAR(255) NOT NULL,
    
    user_id uuid,

    family_id INT,
    PRIMARY KEY (vax_id),  
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (family_id) REFERENCES family(family_id) 
);

CREATE TABLE profile(
    profile_id SERIAL,
    PRIMARY KEY (profile_id),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth VARCHAR(255) NOT Null,
    gender VARCHAR(255) NOT NULL,
    home_address VARCHAR(255) NOT Null,
    country VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    zip_code VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    
    phone_number VARCHAR(255),
    
    user_id uuid,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    family_id INT,
    FOREIGN KEY (family_id) REFERENCES family(family_id) 
    
);

CREATE TABLE family(
    family_id SERIAl,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR (50) NOT NULL,
    date_of_birth VARCHAR(30) NOT NULL,
    PRIMARY KEY (family_id),
    user_id uuid,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );


CREATE TABLE more_information(
      more_information_id SERIAL,
      Doctor_name VARCHAR(255),
      Doctor_address VARCHAR(255) ,
      Doctor_phone_number VARCHAR(255) ,
      BLOOD_TYPE VARCHAR(255),
      Emergency_Contact VARCHAR(255) ,
      Allergies VARCHAR(255) ,
      Medication VARCHAR(255),
      Medical_Condition VARCHAR(255) ,
      Social_Security_Number VARCHAR(255),
      Insurance_Provider VARCHAR(255) ,
      Group_Number VARCHAR(255) ,
      Preferred_Hospital VARCHAR(255) ,
      Preferred_Pharmacy VARCHAR(255) ,
      PRIMARY KEY (more_information_id),
      user_id uuid,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    family_id INT,
    FOREIGN KEY (family_id) REFERENCES family(family_id)
);

CREATE TABLE appointment(
    appointment_id SERIAL PRIMARY KEY,
    apt_date VARCHAR(255) NOT NULL,
    apt_vax_name VARCHAR(255) NOT NULL,
    apt_location VARCHAR(255) NOT NULL,

family_id INT,
     user_id uuid,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (family_id) REFERENCES family(family_id) ON DELETE CASCADE

);


CREATE TABLE Gender
(   gender_id SERIAL PRIMARY KEY,
    gender TEXT,
    user_id uuid,
    FOREIGN KEY (user_id) REFERENCES users(user_id)

);



user_id VARCHAR REFERENCES users(user_id) ON DELETE CASCADE



INSERT INTO users(user_name,user_email,user_password) VALUES('john','john213@gmail.com','pppl1822');
INSERT INTO vaccine_detail(vax_name,vax_date,Name_of_Provider,user_id,child_id) VALUES('Moderna','6/28/2022','Fidelis','cbf20d36-21f1-4655-84df-c7d41471b02b','2');
INSERT INTO profile(first_name,last_name,phone_number,email,DOB,Address,user_id,child_id) VALUES('Muhammad','muneeb','3479512233','muneeb1314@gmail.com','3/3/2013','1632 castleton ave','95a44e02-cae9-4a83-bf1d-59b20d5d0305','2');
INSERT INTO child(child_email,child_phone_number) VALUES('joeph11@gmaiil.com','5674443222');

INSERT INTO child(child_email,child_phone_number) VALUES('joeph11@gmaiil.com','5674443222');

