import {sqliteTable,text,integer} from 'drizzle-orm/sqlite-core';
export const quota=sqliteTable('request_quota',{scope:text('scope').primaryKey(),count:integer('count').notNull().default(0),expires:integer('expires').notNull()});
