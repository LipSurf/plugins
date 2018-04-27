<slide>
	<div class="card slide-in-right">
	<yield/>
	<div class="control-bar">
		<pulsating-btn>
			Say <span class="pulsate-fwd"> Next </span> to continue
		</pulsating-btn>
		<div>-or-</div>
		<pulsating-btn class="small">
			Say &quot;close tab&quot; to close the tutorial
		</pulsating-btn>
	</div>
	</div>
	<style>
		.card {
			max-width: 800px;
			margin: 0 auto;
			background-color: #fff;
			padding: 25px;
			box-shadow: #b3b3b3 2px 8px 8px 2px;
		}

		.visible {
			display: block;
		}

		.control-bar {
			text-align: center;
		}

		.slide-in-right {
			-webkit-animation: slide-in-right 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
					animation: slide-in-right 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
		}

		@-webkit-keyframes slide-in-right {
		  0% {
			-webkit-transform: translateX(1000px);
					transform: translateX(1000px);
			opacity: 0;
		  }
		  100% {
			-webkit-transform: translateX(0);
					transform: translateX(0);
			opacity: 1;
		  }
		}
		@keyframes slide-in-right {
		  0% {
			-webkit-transform: translateX(1000px);
					transform: translateX(1000px);
			opacity: 0;
		  }
		  100% {
			-webkit-transform: translateX(0);
					transform: translateX(0);
			opacity: 1;
		  }
		}

@-webkit-keyframes slide-out-left {
  0% {
    -webkit-transform: translateX(0);
            transform: translateX(0);
    opacity: 1;
  }
  100% {
    -webkit-transform: translateX(-1000px);
            transform: translateX(-1000px);
    opacity: 0;
  }
}
@keyframes slide-out-left {
  0% {
    -webkit-transform: translateX(0);
            transform: translateX(0);
    opacity: 1;
  }
  100% {
    -webkit-transform: translateX(-1000px);
            transform: translateX(-1000px);
    opacity: 0;
  }
}

.slide-out-left {
	-webkit-animation: slide-out-left 0.5s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;
	        animation: slide-out-left 0.5s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;
}


	</style>
	<script>

	</script>
</slide>
