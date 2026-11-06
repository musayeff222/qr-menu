import Database from "better-sqlite3";

const db = new Database("./qrmenu.sqlite");
const exists = db
  .prepare("select count(*) as n from product_variants where product_id = 3 and name like 'QA %'")
  .get();
if (!exists.n) {
  const ins = db.prepare(
    "insert into product_variants (product_id, name, price, sort_order) values (3, ?, ?, ?)"
  );
  ins.run("QA Kiçik", 10, 0);
  ins.run("QA Böyük", 16, 1);
  console.log("inserted QA variants on product 3");
} else {
  console.log("QA variants already present", exists.n);
}
console.log(db.prepare("select id, name, price from product_variants where product_id = 3").all());
const empty = db
  .prepare(
    "select count(*) as n from products where restaurant_id = 2 and (image_url is null or image_url = '')"
  )
  .get();
console.log("emptyImg", empty);
db.close();
