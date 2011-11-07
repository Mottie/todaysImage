$(function(){

 var date = new Date(),
  hsh = window.location.hash,
  debugDate = (hsh.match('#debug')) ? hsh.replace('#debug:','') : date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();

 $('#nav .debug-date').val(debugDate); 

 $('#nav .debug').click(function(){
  window.location.hash = "#debug:" + $('#nav .debug-date').val();
  window.location.reload();
  return false;
 });

 $('#nav .random').click(function(){
  $('#todaysImage').data('todaysImage').randomImage();
  return false;
 });

});