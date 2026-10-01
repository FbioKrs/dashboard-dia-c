/* ================================================================
   PAINEL DE ACOMPANHAMENTO — PG-V1
   Comportamentos compartilhados
   ================================================================ */

(function () {

    const config =
        window.PAINEL_CONFIG || {};


    function ajustarTela() {

        const stage =
            document.getElementById(
                "stage"
            );


        if (!stage) {
            return;
        }


        const larguraBase =
            Number(
                config.tela?.largura
            )
            || 1920;


        const alturaBase =
            Number(
                config.tela?.altura
            )
            || 1080;


        const escala =
            Math.min(

                window.innerWidth
                /
                larguraBase,

                window.innerHeight
                /
                alturaBase

            );


        stage.style.transform =
            `translate(-50%, -50%) scale(${escala})`;

    }


    function iniciar() {

        ajustarTela();


        window.addEventListener(
            "resize",
            ajustarTela
        );

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            iniciar,
            {
                once: true
            }
        );

    }
    else {

        iniciar();

    }


    window.PAINEL_BASE = {

        ajustarTela

    };

})();
