<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("hop.dev", "root", "root", "hop");

$result = $conn->query("SELECT Name, Lat, Lng FROM Locations");

$outp = "";
while($rs = $result->fetch_array(MYSQLI_ASSOC)) {
    if ($outp != "") {$outp .= ",";}
    $outp .= '{"Name":"'  . $rs["Name"] . '",';
    $outp .= '"Lat":"'   . $rs["Lat"]        . '",';
    $outp .= '"Lng":"'. $rs["Lng"]     . '"}'; 
}
$outp ='{"Locations":['.$outp.']}';
$conn->close();

echo($outp);
?>