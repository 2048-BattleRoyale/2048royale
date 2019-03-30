<template>
  <div class="board">
    <canvas
      id="game-board"
      class="game-board"
      width="500px"
      height="500px"
      style="border:1px solid #000000;"
    ></canvas>
  </div>
</template>

<script>
export default {
  name: "Board",
  props: {}
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
