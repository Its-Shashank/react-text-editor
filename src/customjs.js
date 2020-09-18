 // eslint-disable-next-line
 import React from 'react';
 import $ from 'jquery';
 
 $(document).ready(function(){
   $("#vertical-tab-one-tab").click(function(){
     $("#vertical-tab-one").addClass("mobileviewtexttool");
   $(".rwt__tablist").addClass("mainTabs");
   $(".mtftool").removeClass("mactive");
   $(".textHeading").addClass("mactive");	 
   });
   $("#vertical-tab-two-tab").click(function(){
     $("#vertical-tab-two").addClass("mobileviewtool");
   $(".rwt__tablist").addClass("mainTabs");
   });
   $("#vertical-tab-three-tab").click(function(){
     $("#vertical-tab-three").addClass("mobileviewtool");
   $(".rwt__tablist").addClass("mainTabs");
   });
   $("#vertical-tab-four-tab").click(function(){
     $("#vertical-tab-four").addClass("mobileviewtool");
   $(".rwt__tablist").addClass("mainTabs");
   });
   $("#vertical-tab-five-tab").click(function(){
     $("#vertical-tab-five").addClass("mobileviewtool");
   $(".rwt__tablist").addClass("mainTabs");
   });
   $("#vertical-tab-six-tab").click(function(){
     $("#vertical-tab-six").addClass("mobileviewtool");
   $(".rwt__tablist").addClass("mainTabs");
   });
   
   $(".tabheading").click(function(){
   $("#vertical-tab-one").removeClass("mobileviewtool");
   $(".rwt__tablist").removeClass("mainTabs");
   });
   $(".tabheading").click(function(){
   $("#vertical-tab-two").removeClass("mobileviewtool");
   $(".rwt__tablist").removeClass("mainTabs");
   });
   $(".tabheading").click(function(){
   $("#vertical-tab-three").removeClass("mobileviewtool");
   $(".rwt__tablist").removeClass("mainTabs");
   });
   $(".tabheading").click(function(){
   $("#vertical-tab-four").removeClass("mobileviewtool");
   $(".rwt__tablist").removeClass("mainTabs");
   });
   $(".tabheading").click(function(){
   $("#vertical-tab-five").removeClass("mobileviewtool");
   $(".rwt__tablist").removeClass("mainTabs");
   });
   $(".tabheading").click(function(){
   $("#vertical-tab-six").removeClass("mobileviewtool");
   $(".rwt__tablist").removeClass("mainTabs");
   });
   
   
   $(".hidetextfill").click(function(){
   $("#vertical-tab-one").removeClass("mobileviewtexttool");
   $(".rwt__tablist").removeClass("mainTabs");
   });
   
   $("#tabOne").click(function(){
     $(".mtabtxt").removeClass("mactive");
   $(this).addClass("mactive");
   $(".mtftool").removeClass("mactive");
   $(".mfontfamily").addClass("mactive");
   });
   $("#tabTwo").click(function(){
     $(".mtabtxt").removeClass("mactive");
   $(this).addClass("mactive");
   $(".mtftool").removeClass("mactive");
   $(".mtextsize").addClass("mactive");
   });
   $("#tabThree").click(function(){
     $(".mtabtxt").removeClass("mactive");
   $(this).addClass("mactive");
   $(".mtftool").removeClass("mactive");
   $(".mtextformat").addClass("mactive");
   });
   $("#tabFour").click(function(){
     $(".mtabtxt").removeClass("mactive");
   $(this).addClass("mactive");
   $(".mtftool").removeClass("mactive");
   $(".mtextcolor").addClass("mactive");
   });
   $("#tabFive").click(function(){
     $(".mtabtxt").removeClass("mactive");
   $(this).addClass("mactive");
   $(".mtftool").removeClass("mactive");
   $(".mtextalign").addClass("mactive");
   });
   $("#tabSix").click(function(){
     $(".mtabtxt").removeClass("mactive");
   $(this).addClass("mactive");
   $(".mtftool").removeClass("mactive");
   $(".lineHeight").addClass("mactive");
   });
   $("#tabSeven").click(function(){
     $(".mtabtxt").removeClass("mactive");
   $(this).addClass("mactive");
   $(".mtftool").removeClass("mactive");
   $(".lineSpacing").addClass("mactive");
   });
   
   $(".msolidColor").click(function(){
     $(".mpattern").removeClass("mactive");
   $(this).addClass("mactive");
   $(".background-editer2").removeClass("mactive");
   $(".background-editer1").addClass("mactive");
   });
   $(".mpattern").click(function(){
     $(".msolidColor").removeClass("mactive");
   $(this).addClass("mactive");
   $(".background-editer1").removeClass("mactive");
   $(".background-editer2").addClass("mactive");
   });
   
   
   
 });
 
 
 // WEBPACK FOOTER //
 // ./src/customjs.js