//ดึง json จาก api
async function get_json(url){
    const request_data = await fetch(url);

    if(request_data.status === 200) {
        const json_data = await  request_data.json();
        console.log(request_data.status);
        return json_data;
    }else if(request_data.status === 403){
        return "cannot_get_data";
    }
}

//นับจำนวนหลักสูตรที่ไม่ใช้ tgat
async function all_non_tgat(){
    //สำหรับบันทึกข้อมูล
    var data_all_non_tgat = [];
    var course_all_non_tgat = [];
    let num_course_non_tgat = 0;

    let all_course = 0;
    let all_program = 0;

    let cannot_get_data = 0;
    let num_of_non_tgat = 0;

    const data = await get_json("https://tcas66.s3.ap-southeast-1.amazonaws.com/mytcas/courses.json");

    //นับถอยหลังเวลส การนับจำนวน
    let time_end = new Date().getTime() + (data.length*1000);
    var x = setInterval(function() {
        var now = new Date().getTime();
        var distance = time_end - now;

        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        //web page show
        document.getElementById("cooldown-time").innerHTML = "การดึงข้อมูลจะเสร็จสิ้นในอีก "+ hours +" ชั่วโมง "+ minutes +" นาที "+ seconds +" วินาที";
    });


        for(let i in data){
        setTimeout(async function timer() {

            const round_data = await get_json("https://tcas66.s3.ap-southeast-1.amazonaws.com/mytcas/rounds/" + data[i]["program_id"] + ".json");

            if(round_data !== "cannot_get_data") {

                all_course += 1;
                let check_course_non_tgat = 0;
                for (let program in round_data) {
                    all_program += 1;
                    if (round_data[program]["type"] == "3_2566") {
                        if (round_data[program]["scores"]["tgat"] || round_data[program]["scores"]["tgat1"] || round_data[program]["scores"]["tgat2"] || round_data[program]["scores"]["tgat3"]) {
                            //มี TGATรวม 1 2 3
                        } else {
                            //ไม่มี TGAT 1 2 3
                            course_all_non_tgat[num_of_non_tgat] = data[i];
                            data_all_non_tgat[num_of_non_tgat] = round_data[program];
                            num_of_non_tgat += 1;

                            check_course_non_tgat += 1;
                        }
                    }
                }
                if (check_course_non_tgat > 0) {
                    course_all_non_tgat[num_course_non_tgat] = data[i];

                    num_course_non_tgat += 1;
                }

                //แสดงจำนวนหลักสูตรที่ไม่ใช้คะแนน TGAT บน web page
                document.getElementById("course_non_tgat").innerHTML = "จำนวนหลักสูตรที่ไม่ใช้ TGAT ในรอบ 3 : "+ num_course_non_tgat +"/"+ data.length +" หลักสูตร";
                //แสดงจำนวนโครงการที่ไม่ใช้คะแนน TGAT บน web page
                document.getElementById("program_non_tgat").innerHTML = "จำนวนโครงการในรอบ 3 ที่ไม่ใช้ TGAT : "+ num_of_non_tgat +"/"+ all_program +" โครงการ";
                //แสดงจำนวนหลักสูตรที่ถึงข้อมูลจาก TGAT ไม่สำเร็จ
                document.getElementById("non_tgat").innerHTML = "ดึงข้อมูลจาก mytcas.com ไม่สำเร็จ "+ cannot_get_data +" หลักสูตร";
                //แสดงจำนวนข้อมูลที่ดึง
                document.getElementById("num-requset").innerHTML = "ดึงข้อมูลจาก mytcas.com สำเร็จไปแล้วจำนวน "+ all_course +" หลักสูตร";


                //log
                console.log("จำนวนหลักสูตรที่ไม่ใช้ TGAT รอบ 3 :" + num_course_non_tgat + " หลักสูตร | จำนวนโครงการในรอบ 3 ที่ไม่ใช้ TGAT :" + num_of_non_tgat + " | ผ่านการตรวจสอบไปแล้ว :" + all_course + "/" + data.length + " หลักสตร | ดึงข้อมูลไม่สำเร็จ :"+cannot_get_data+" ครั้ง");
                console.log(JSON.stringify(data_all_non_tgat));
                console.log(JSON.stringify(course_all_non_tgat));
            }else{
                cannot_get_data += 1;
                console.log("จำนวนหลักสูตรที่ไม่ใช้ TGAT รอบ 3 :" + num_course_non_tgat + " หลักสูตร | จำนวนโครงการในรอบ 3 ที่ไม่ใช้ TGAT :" + num_of_non_tgat + " | ผ่านการตรวจสอบไปแล้ว :" + all_course + "/" + data.length + " หลักสตร | ดึงข้อมูลไม่สำเร็จ :"+cannot_get_data+" ครั้ง");
            }
        }, i*1000);
    }
    //console.log("จำนวนหลักสูตรที่ไม่ใช้ TGAT :"+num_of_non_tgat);
}
all_non_tgat();