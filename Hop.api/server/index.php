<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "joelhenr_admin", "Byzance0629", "joelhenr_Locations");

$result = $conn->query("SELECT LocationID, Time, RunNo FROM TimeTable");

$outp = "";
while($rs = $result->fetch_array(MYSQLI_ASSOC)) {
    if ($outp != "") {$outp .= ",";}
    $outp .= '{"LocationID":"'  . $rs["LocationID"] . '",';
    $outp .= '"Time":"'   . substr($rs["Time"],11)        . '",';
    $outp .= '"RunNo":"'. $rs["RunNo"]     . '"}'; 
}
$outp ='{"TimeTable":['.$outp.']}';
$conn->close();

echo($outp);
?>