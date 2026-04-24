async function test() {
  try {
    const res = await fetch("https://thingproxy.freeboard.io/fetch/https%3A%2F%2Fwww.myfxbook.com%2Fapi%2Flogin.json%3Femail%3Dtest%2540test.com%26password%3Dtest");
    console.log(res.status);
    console.log(await res.text());
  } catch(e) {
    console.error(e);
  }
}
test();
