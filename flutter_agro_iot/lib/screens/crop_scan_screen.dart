import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import '../main.dart';
import '../models/crop_scan_result.dart';

class CropScanScreen extends StatefulWidget {
  const CropScanScreen({super.key});

  @override
  State<CropScanScreen> createState() => _CropScanScreenState();
}

class _CropScanScreenState extends State<CropScanScreen> {
  final ImagePicker _picker = ImagePicker();
  String? _selectedImagePath;
  String? _selectedSampleHint;
  bool _isAnalyzing = false;
  CropScanResult? _latestResult;

  Future<void> _pickImage(ImageSource source) async {
    try {
      final XFile? file = await _picker.pickImage(source: source);
      if (file != null) {
        setState(() {
          _selectedImagePath = file.path;
          _selectedSampleHint = null;
        });
      }
    } catch (_) {
      // Fallback for desktop/preview
    }
  }

  void _selectSample(String hint, String name) {
    setState(() {
      _selectedSampleHint = hint;
      _selectedImagePath = 'sample_$hint';
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Selected sample: $name'), duration: const Duration(seconds: 1)),
    );
  }

  Future<void> _analyzeCrop() async {
    if (_selectedImagePath == null) return;
    setState(() => _isAnalyzing = true);

    final state = context.read<AgroAppState>();
    final result = await state.aiAdapter.analyzeCrop(
      _selectedImagePath!,
      sampleHint: _selectedSampleHint,
    );

    setState(() {
      _latestResult = result;
      _isAnalyzing = false;
    });

    state.addScanResult(result);
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // AI Architecture & SIH Banner
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: const Color(0xFFE8F5E9),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFA5D6A7)),
          ),
          child: const Row(
            children: [
              Icon(Icons.memory_rounded, color: Color(0xFF2E7D32), size: 24),
              SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'AI Inference Architecture (Mock Engine)',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF1B5E20)),
                    ),
                    Text(
                      'SIH 26180 compliant. Decoupled AIInferenceAdapter ready for TensorFlow Lite / Edge Impulse deployment.',
                      style: TextStyle(fontSize: 11, color: Colors.black87),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 16),

        // Sample Quick Selectors
        const Text(
          'Select Leaf Specimen or Take Photo:',
          style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              ActionChip(
                avatar: const Icon(Icons.check_circle_outline, size: 16, color: Colors.green),
                label: const Text('Healthy Wheat Leaf'),
                onPressed: () => _selectSample('healthy', 'Healthy Wheat'),
              ),
              const SizedBox(width: 8),
              ActionChip(
                avatar: const Icon(Icons.coronavirus_outlined, size: 16, color: Colors.red),
                label: const Text('Tomato Early Blight'),
                onPressed: () => _selectSample('blight', 'Tomato Early Blight'),
              ),
              const SizedBox(width: 8),
              ActionChip(
                avatar: const Icon(Icons.bug_report_outlined, size: 16, color: Colors.amber),
                label: const Text('Cotton Aphid Infestation'),
                onPressed: () => _selectSample('aphid', 'Cotton Aphid Infestation'),
              ),
            ],
          ),
        ),

        const SizedBox(height: 16),

        // Camera & Gallery Trigger Card
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                Container(
                  height: 180,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.grey.shade300, style: BorderStyle.solid),
                  ),
                  child: _selectedImagePath == null
                      ? const Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.camera_alt_outlined, size: 48, color: Colors.black38),
                            SizedBox(height: 8),
                            Text(
                              'Capture Leaf Photo or Select Sample',
                              style: TextStyle(color: Colors.black54, fontSize: 13),
                            ),
                          ],
                        )
                      : Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.image_search_rounded, size: 54, color: Color(0xFF2E7D32)),
                              const SizedBox(height: 8),
                              Text(
                                _selectedSampleHint != null ? 'Sample: ${_selectedSampleHint!.toUpperCase()}' : 'Custom Foliage Captured',
                                style: const TextStyle(fontWeight: FontWeight.bold),
                              ),
                              const Text(
                                'Resolution: 1080x1920 • RGB Spectrum',
                                style: TextStyle(fontSize: 11, color: Colors.black54),
                              ),
                            ],
                          ),
                        ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        icon: const Icon(Icons.photo_camera_rounded, size: 18),
                        label: const Text('Camera'),
                        onPressed: () => _pickImage(ImageSource.camera),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: OutlinedButton.icon(
                        icon: const Icon(Icons.photo_library_rounded, size: 18),
                        label: const Text('Gallery'),
                        onPressed: () => _pickImage(ImageSource.gallery),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    icon: _isAnalyzing
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : const Icon(Icons.psychology_rounded),
                    label: Text(_isAnalyzing ? 'Analyzing Foliage Neural Net...' : 'Analyze Foliage'),
                    onPressed: _selectedImagePath != null && !_isAnalyzing ? _analyzeCrop : null,
                  ),
                ),
              ],
            ),
          ),
        ),

        const SizedBox(height: 16),

        // Analysis Results View
        if (_latestResult != null) ...[
          Card(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: BorderSide(
                color: _latestResult!.healthStatus == 'Healthy' ? Colors.green.shade400 : Colors.red.shade400,
                width: 1.5,
              ),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        _latestResult!.cropName,
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: _latestResult!.healthStatus == 'Healthy' ? Colors.green.shade50 : Colors.red.shade50,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          _latestResult!.healthStatus.toUpperCase(),
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: _latestResult!.healthStatus == 'Healthy' ? Colors.green.shade800 : Colors.red.shade800,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Disease Detected', style: TextStyle(fontSize: 11, color: Colors.black54)),
                            Text(
                              _latestResult!.diseaseDetected,
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Pest Detected', style: TextStyle(fontSize: 11, color: Colors.black54)),
                            Text(
                              _latestResult!.pestDetected,
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      const Text('Model Confidence: ', style: TextStyle(fontSize: 12, color: Colors.black54)),
                      Text(
                        '${_latestResult!.confidencePercent.toStringAsFixed(1)}%',
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF2E7D32)),
                      ),
                    ],
                  ),
                  const Divider(height: 20),
                  const Text('Farmer Recommendation', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 4),
                  Text(_latestResult!.recommendation, style: const TextStyle(fontSize: 12, height: 1.4)),
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F8E9),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('🌱 Organic Treatment:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF2E7D32))),
                        Text(_latestResult!.organicRemedy, style: const TextStyle(fontSize: 11)),
                        const SizedBox(height: 6),
                        const Text('🧪 Chemical Intervention (if required):', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.deepOrange)),
                        Text(_latestResult!.chemicalRemedy, style: const TextStyle(fontSize: 11)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ],
    );
  }
}
