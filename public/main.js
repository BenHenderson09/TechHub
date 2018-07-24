$(document).ready(()=>{
    $('.deleteArticle').on('click', deleteArticle);
});

function deleteArticle(){
var confirmation = confirm("Are You Sure You Want to Delete This Article?");

if(confirmation){
 $.ajax({
    type:'DELETE',
    url: '/articles/delete/' + $(this).data('id')
 });
 window.location.replace('/home/{ "msg":"Article Deleted Successfully", "type":"success" }');
 }
}
