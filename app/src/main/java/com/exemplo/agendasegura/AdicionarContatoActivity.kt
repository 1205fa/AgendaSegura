import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.net.Uri
import android.os.Bundle
import android.provider.MediaStore
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import java.io.File
import java.io.FileOutputStream
import java.text.SimpleDateFormat
import java.util.*

class AdicionarContatoActivity : AppCompatActivity() {

    private lateinit var etNome: EditText
    private lateinit var etTelefone: EditText
    private lateinit var switchNumeroOculto: Switch
    private lateinit var btnTirarFoto: Button
    private lateinit var btnGravarVideo: Button
    private lateinit var btnSalvarContato: Button
    private lateinit var btnVoltar: Button
    private lateinit var imgFotoPreview: ImageView
    private lateinit var tvVideoInfo: TextView

    private var caminhoFoto: String? = null
    private var caminhoVideo: String? = null
    private var fotoUri: Uri? = null
    private var videoUri: Uri? = null

    companion object {
        private const val REQUEST_IMAGE_CAPTURE = 1
        private const val REQUEST_VIDEO_CAPTURE = 2
        private const val PERMISSION_REQUEST_CODE = 100
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_adicionar_contato)

        initComponents()
        setupClickListeners()
        checkPermissions()

        // Se está editando um contato existente
        carregarDadosContato()
    }

    private fun initComponents() {
        etNome = findViewById(R.id.etNome)
        etTelefone = findViewById(R.id.etTelefone)
        switchNumeroOculto = findViewById(R.id.switchNumeroOculto)
        btnTirarFoto = findViewById(R.id.btnTirarFoto)
        btnGravarVideo = findViewById(R.id.btnGravarVideo)
        btnSalvarContato = findViewById(R.id.btnSalvarContato)
        btnVoltar = findViewById(R.id.btnVoltar)
        imgFotoPreview = findViewById(R.id.imgFotoPreview)
        tvVideoInfo = findViewById(R.id.tvVideoInfo)
    }

    private fun setupClickListeners() {
        btnTirarFoto.setOnClickListener {
            tirarFoto()
        }

        btnGravarVideo.setOnClickListener {
            gravarVideo()
        }

        btnSalvarContato.setOnClickListener {
            salvarContato()
        }

        btnVoltar.setOnClickListener {
            finish()
        }
    }

    private fun carregarDadosContato() {
        val nome = intent.getStringExtra("contato_nome")
        val telefone = intent.getStringExtra("contato_telefone")
        val numeroOculto = intent.getBooleanExtra("contato_oculto", false)

        nome?.let { etNome.setText(it) }
        telefone?.let { etTelefone.setText(it) }
        switchNumeroOculto.isChecked = numeroOculto
    }

    private fun checkPermissions() {
        val permissions = arrayOf(
            Manifest.permission.CAMERA,
            Manifest.permission.WRITE_EXTERNAL_STORAGE,
            Manifest.permission.READ_EXTERNAL_STORAGE,
            Manifest.permission.RECORD_AUDIO
        )

        val permissionsToRequest = permissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }

        if (permissionsToRequest.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, permissionsToRequest.toTypedArray(), PERMISSION_REQUEST_CODE)
        }
    }

    private fun tirarFoto() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            Toast.makeText(this, "Permissão de câmera necessária!", Toast.LENGTH_SHORT).show()
            return
        }

        val intent = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
        if (intent.resolveActivity(packageManager) != null) {

            // Criar arquivo para salvar a foto
            val fotoFile = criarArquivoFoto()
            fotoFile?.let {
                fotoUri = FileProvider.getUriForFile(
                    this,
                    "com.exemplo.agendasegura.fileprovider",
                    it
                )
                intent.putExtra(MediaStore.EXTRA_OUTPUT, fotoUri)
                startActivityForResult(intent, REQUEST_IMAGE_CAPTURE)
            }
        } else {
            Toast.makeText(this, "Câmera não disponível!", Toast.LENGTH_SHORT).show()
        }
    }

    private fun gravarVideo() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED ||
            ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            Toast.makeText(this, "Permissões de câmera e áudio necessárias!", Toast.LENGTH_SHORT).show()
            return
        }

        val intent = Intent(MediaStore.ACTION_VIDEO_CAPTURE)
        if (intent.resolveActivity(packageManager) != null) {

            // Criar arquivo para salvar o vídeo
            val videoFile = criarArquivoVideo()
            videoFile?.let {
                videoUri = FileProvider.getUriForFile(
                    this,
                    "com.exemplo.agendasegura.fileprovider",
                    it
                )
                intent.putExtra(MediaStore.EXTRA_OUTPUT, videoUri)
                intent.putExtra(MediaStore.EXTRA_DURATION_LIMIT, 30) // Limitar a 30 segundos
                startActivityForResult(intent, REQUEST_VIDEO_CAPTURE)
            }
        } else {
            Toast.makeText(this, "Gravação de vídeo não disponível!", Toast.LENGTH_SHORT).show()
        }
    }

    private fun criarArquivoFoto(): File? {
        return try {
            val timestamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
            val nomeArquivo = "FOTO_${timestamp}_"
            val diretorio = File(getExternalFilesDir("Pictures"), "AgendaSegura")
            if (!diretorio.exists()) diretorio.mkdirs()

            val arquivo = File.createTempFile(nomeArquivo, ".jpg", diretorio)
            caminhoFoto = arquivo.absolutePath
            arquivo
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    private fun criarArquivoVideo(): File? {
        return try {
            val timestamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
            val nomeArquivo = "VIDEO_${timestamp}_"
            val diretorio = File(getExternalFilesDir("Movies"), "AgendaSegura")
            if (!diretorio.exists()) diretorio.mkdirs()

            val arquivo = File.createTempFile(nomeArquivo, ".mp4", diretorio)
            caminhoVideo = arquivo.absolutePath
            arquivo
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)

        when (requestCode) {
            REQUEST_IMAGE_CAPTURE -> {
                if (resultCode == RESULT_OK) {
                    // Mostrar preview da foto
                    caminhoFoto?.let { caminho ->
                        val bitmap = MediaStore.Images.Media.getBitmap(contentResolver, fotoUri)
                        imgFotoPreview.setImageBitmap(bitmap)
                        imgFotoPreview.visibility = android.view.View.VISIBLE
                        Toast.makeText(this, "Foto capturada com sucesso!", Toast.LENGTH_SHORT).show()
                    }
                }
            }
            REQUEST_VIDEO_CAPTURE -> {
                if (resultCode == RESULT_OK) {
                    caminhoVideo?.let {
                        tvVideoInfo.text = "✅ Vídeo gravado com sucesso!"
                        tvVideoInfo.visibility = android.view.View.VISIBLE
                        Toast.makeText(this, "Vídeo gravado com sucesso!", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        }
    }

    private fun salvarContato() {
        val nome = etNome.text.toString().trim()
        val telefone = etTelefone.text.toString().trim()

        if (nome.isEmpty()) {
            showError("Nome é obrigatório!")
            return
        }

        if (telefone.isEmpty()) {
            showError("Telefone é obrigatório!")
            return
        }

        // Salvar contato (aqui você salvaria no banco de dados)
        val prefs = getSharedPreferences("AgendaSegura", MODE_PRIVATE)
        val editor = prefs.edit()

        // Exemplo simples de salvamento (em produção usaria banco de dados)
        val contatosJson = prefs.getString("contatos", "[]")

        // Criar objeto contato
        val novoContato = """
            {
                "nome": "$nome",
                "telefone": "$telefone",
                "numeroOculto": ${switchNumeroOculto.isChecked},
                "caminhoFoto": "$caminhoFoto",
                "caminhoVideo": "$caminhoVideo"
            }
        """.trimIndent()

        Toast.makeText(this, "Contato salvo com sucesso!", Toast.LENGTH_LONG).show()
        finish()
    }

    private fun showError(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == PERMISSION_REQUEST_CODE) {
            val allGranted = grantResults.all { it == PackageManager.PERMISSION_GRANTED }
            if (!allGranted) {
                Toast.makeText(this, "Algumas funcionalidades podem não funcionar sem as permissões", 
                    Toast.LENGTH_LONG).show()
            }
        }
    }
}
